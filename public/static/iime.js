$(function(){
    $(".navbar-menu").click(function(){
        $(".navbar-item").toggle();
    });

    $(window).scroll(function(e){
        if($(this).scrollTop() > 200){
            $('#go-top').fadeIn(400);
        }else{
            $('#go-top').stop().fadeOut(400);
        }
    });
    $('#go-top').click(function(){
        $('html,body').animate({scrollTop:'0px'}, 200);
    });
});