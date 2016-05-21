$(document).ready(function() {
    $(".circle").hover(function(data) {
        if(data.type === "mouseenter"){
            $(this).children("div").css("color", "#ccc");
        }
        else
            $(this).children("div").css("color", "#333");
    })
});