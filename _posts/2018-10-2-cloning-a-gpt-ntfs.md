---
layout: default
title: Cloning a GPT/NTFS Windows Drive
subtitle: How to clone a Windows harddrive to a smaller drive using a Linux machine surrogate 
---

In this guide I'll walkthrough what I did to get a 1TB spinning hard disk running Windows 10
cloned to a 256GB SSD using a Linux machine surrogate. I think these steps can be reproduced
using some live USB distros as well. As a warning **this will truncate recovery partitions**.

Shrink the Data Partition
========

Before removing the disk from the host machine, boot Windows up one last time to shrink the
partition down.
* Open 'Disk Management' from the Control Panel or Windows menu
* Right click the main data partition and select Shrink
* Shrink the volume to a size below the target disk size
* If successful skip the next section

Possible Limiting Factors of Shrinking
---------

Windows stores some things at the end of the system partition which may limit the ability to
shrink the volume. If the Shrink operation is giving a maximum shrink size that isn't large
enough, try the following and reboot.

* Disable page file
  * In System->Advanced->Performance->Settings->Advanced->Virtual memory->Change
* Disable hibernation
  * In an administrative command prompt use `powercfg /h off`
* Disable fast startup
  * Didn't seem to affect shrink size but may help to stop corruption of the BCD
  * Power Options->Choose what the power buttons do->Turn on fast startup (uncheck)

In Linux
=========

Once the source drive's data volume has been shrunk appropriately, attach both the source and
target drives to a Linux machine. Identify which devices in `/dev/sd*` are which by using
`fdisk -l /dev/sda`. You should see roughly the following for the source drive:

```
Disk /dev/sda: 931.5 GiB, 1000204886016 bytes, 1953525168 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: gpt
Disk identifier: 610F7F53-E81F-4587-873F-83AD7E58AE66

Device          Start        End   Sectors   Size Type
/dev/sda1        2048    1026047   1024000   500M EFI System
/dev/sda2     1026048    1107967     81920    40M unknown
/dev/sda3     1107968    1370111    262144   128M Microsoft reserved
/dev/sda4     1370112    2906111   1536000   750M Windows recovery environment
/dev/sda5     2906112  293773311 290867200 138.7G Microsoft basic data
/dev/sda6  1932173312 1934055423   1882112   919M Windows recovery environment
/dev/sda7  1934055424 1953523119  19467696   9.3G Windows recovery environment
```

Verify that the end of the data volume is within the bounds of your target drive. In this case
sectors are 512 bytes and the end of the data volume is at 293773311 sectors which is roughly
150GB, well within my 240GB SSD drive capacity. Note that there are still recovery paritions
**past** the end of the data partition. **These will get truncated in the following cloning
process** but should not affect the Windows installation.


Cloning with DD
--------

Next begin a truncated copy of the source disk to target using dd. Use a block size and count
such that only the partitions up to and including the data partition are fully copied. For
simplicity I used the block size that `fdisk` reported in and then used the End sector of my
data partition.

```bash
dd if=/dev/sda of=/dev/sdb bs=512 count=293773311
```

Fixing the GPT
--------

Performing a truncated copy of the disk will corrupt the GPT. Luckily this can be fixed using
gdisk. Enter gdisk and perform the following operations:

* Delete any partitions after the data partition using `d`
* Fit the GPT to the new disk size using expert `x` option `e`
* Use the main GPT header to rebuild the backup with recovery `r` option `d`
* Write the table to disk with `w`

If at any point you screw up, you can always just copy the first 2048 bytes from the original
disk to restore original GPT and start over.


Verify working NTFS volume
--------

Attempting to mount the filesystem in Linux should succeed, or at least fail saying something
about the filesystem being in an unsafe state due to fast startup or hibernation.

```bash
mount -t ntfs /dev/sda5 /mnt/test
```

In my experience this technique actually succeeded even if the system is in a lower power mode
although probably this isn't *"recommended"*.

Back to Windows
========

Attach the newly cloned target drive to the Windows machine and boot it. If booting fails
error codes like `0xc00000e9` or `0xc0000009` the BCD is likely corrupted. Booting into a
windows restore media and starting a terminal you could try doing a `chkdsk /f`. If it deletes
a bunch of indexes that are outside the disk bounds then you likely did not shrink source disk
data volume sufficiently **or** you did not copy enough of the source disk to the target.