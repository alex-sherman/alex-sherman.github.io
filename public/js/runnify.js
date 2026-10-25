function runnify() {
    $(".runnable").each(function(index, textArea) {
        var code = CodeMirror.fromTextArea(textArea);
        if($(textArea).data("eval")) {
            eval(code.getValue());
        }
        if($(textArea).data("button")) {
            $("#" + $(textArea).data("button")).click(function() { eval(code.getValue()); });
        }
    });
};

$(document).ready(runnify);