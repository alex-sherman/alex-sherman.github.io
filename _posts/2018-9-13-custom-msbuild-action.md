---
layout: default
title: Writing Custom MSBuild Compilation Actions
subtitle: How to make MSBuild actions that compile specific files and copy them nicely
---

I found myself requiring something I thought to be simple in the Visual Studio/MSBuild
compilation ecosystem but turned out to be very difficult and hardly documented. What I
wanted was:

* Mark specific files to be compiled with an external compiler
* Compilation should only occur if the input file has changed
* The result should be copied to the output directory
* Any dependant projects should also get copies of the results
* Dependant projects should also be able to use this compilation method

Ideally it would look something like this:

![](https://i.imgur.com/AWi0k6L.png)

I found a bunch of half working solutions, like using post-build commands but nothing
to tick all the boxes. The new solution I came up with is writing a custom targets.xml that
does the following:

1. Adds a new build action which can be selected for files in the project
2. For each of these files, a command is executed on the file producing an output file
3. Output file is marked as "Content" from MSBuild's perspective
4. Content files get copied to immediate output directory and dependant projects'
output directories

Targets.XML Walkthrough
============

I'll step through what I ended up doing bit by bit, but the full solution can be found 
[at the end](#full-targetsxml). This is the exact solution I used for my project, but
hopefully it is roughly clear which bits to modify to work for your own specific needs.

First we define a custom variable `MGFXPath` that points to my custom compiler and defaults
to 'Dependencies\Utils\2MGFX'.

```xml
<PropertyGroup>
    <MGFXPath Condition="$(MGFXPath) == ''">Dependencies\Utils\2MGFX</MGFXPath>
</PropertyGroup>
```

Next we add the custom build action that can be selected on files called `MGFXCompile`.

```xml
<ItemGroup>
    <AvailableItemName Include="MGFXCompile" />
</ItemGroup>
```

Then comes two similar sections that define what happen on **Build** and **Rebuild**
operations. For **Build** we include an `Inputs=` section, but in **Rebuild** we omit it
so that MSBuild we perform the target regardless of if the input files have changed.

```xml
<Target Name="BuildMGFX" BeforeTargets="Compile" Inputs="%(MGFXCompile.Identity)" Outputs="@(MGFXCompile->'%(RelativeDir)%(Filename).mgfx')">
    <Exec Command="$(MGFXPath) %(MGFXCompile.Identity) %(MGFXCompile.RelativeDir)%(MGFXCompile.Filename).mgfx /Profile:DirectX_11"/>
</Target>

<Target Name="ReBuildMGFX" AfterTargets="Rebuild">
    <Exec Condition="%(MGFXCompile.Identity)!=''" Command="$(MGFXPath) %(MGFXCompile.Identity) %(MGFXCompile.RelativeDir)%(MGFXCompile.Filename).mgfx /Profile:DirectX_11"
          Outputs="@(MGFXCompile.Identity -> %(MGFXCompile.RelativeDir)%(MGFXCompile.Filename).mgfx)"/>
</Target>
```

Next we have a section that marks the resulting output files as "Content". This is kind of the
critical step to getting the output files to be copied around correctly.

```xml
<Target Name="BuildMGFXContent">
    <ItemGroup>
        <Content Condition="%(MGFXCompile.Identity)!=''" Include="%(MGFXCompile.RelativeDir)%(MGFXCompile.Filename).mgfx">
            <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
        </Content>
    </ItemGroup>
</Target>
```
Then to ensure this content faking target gets run we include this last section. This ensures
that before the usual MSBuild `AssignTargetPathsDependsOn` gets run, the `BuildMGFXContent`
target will also get run to include our new output files as "Content".

```xml
<PropertyGroup>
    <AssignTargetPathsDependsOn>
        BuildMGFXContent;
        $(AssignTargetPathsDependsOn);
    </AssignTargetPathsDependsOn>
</PropertyGroup>
```

Full Targets.XML
========
Putting it all together we get the following:

```xml
<Project xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup>
    <MGFXPath Condition="$(MGFXPath) == ''">Dependencies\Utils\2MGFX</MGFXPath>
  </PropertyGroup>
  <ItemGroup>
    <AvailableItemName Include="MGFXCompile" />
  </ItemGroup>
  <Target Name="BuildMGFX" BeforeTargets="Compile" Inputs="%(MGFXCompile.Identity)" Outputs="@(MGFXCompile->'%(RelativeDir)%(Filename).mgfx')">
    <Exec Command="$(MGFXPath) %(MGFXCompile.Identity) %(MGFXCompile.RelativeDir)%(MGFXCompile.Filename).mgfx /Profile:DirectX_11"/>
  </Target>
  <Target Name="ReBuildMGFX" AfterTargets="Rebuild">
    <Exec Condition="%(MGFXCompile.Identity)!=''" Command="$(MGFXPath) %(MGFXCompile.Identity) %(MGFXCompile.RelativeDir)%(MGFXCompile.Filename).mgfx /Profile:DirectX_11"
          Outputs="@(MGFXCompile.Identity -> %(MGFXCompile.RelativeDir)%(MGFXCompile.Filename).mgfx)"/>
  </Target>
  <Target Name="BuildMGFXContent">
    <ItemGroup>
      <Content Condition="%(MGFXCompile.Identity)!=''" Include="%(MGFXCompile.RelativeDir)%(MGFXCompile.Filename).mgfx">
        <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
      </Content>
    </ItemGroup>
  </Target>
  <PropertyGroup>
    <AssignTargetPathsDependsOn>
      BuildMGFXContent;
      $(AssignTargetPathsDependsOn);
    </AssignTargetPathsDependsOn>
  </PropertyGroup>
</Project>
```

Including in a Project.csproj
==========

After having saved the above targets.xml file as 'mgfx.targets.xml', it must be included by manually editing the .csproj project file. Add the following line above the final comments
of the project file:

```xml
<Import Project="mgfx.targets.xml" />
```

In dependant projects that might wish to also use this custom build action it can be included
with a change of path for the build tool. Assuming the original project defining this
targets.xml is called "Spectrum", include the following:

```xml
<PropertyGroup>
    <MGFXPath>..\Spectrum\Dependencies\Utils\2MGFX</MGFXPath>
</PropertyGroup>
<Import Project="..\Spectrum\mgfx.targets.xml" />
```