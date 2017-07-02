var game;
game = (function () {
    var varClock;
    var varTimeRemaining = 0;
    var gameInit = false;
    var initialize = function (_playingTime) {
        gameInit = false;
        $("#panel-wrapper").hide();
        if (typeof(varClock) == 'number') {
            clearInterval(varClock);
        }
        varTimeRemaining = _playingTime;
        varClock = setInterval(_timer, 1000);
        $("[class^='col']").empty();
        _loadAllCandies();
        _resetScore(_playingTime);
        _setTitleAnimate();
        $("#panel-wrapper").show();
        gameInit = true;
    };
    var gameOver = function () {
        $(".panel-tablero").fadeOut(500, function () {
            $(".panel-score").css("width", "100%");
            $("#gameOverTitle").fadeIn(1000);
        });
        clearInterval(varClock);
        $(".main-titulo").stop();
        $(".main-titulo").css("color","#DCFF0E");
    };
    function _timer() {
        varTimeRemaining -= 1;
        $('#timer').html(formatTime(varTimeRemaining));
        if (varTimeRemaining == 0) {
            gameOver();
        }
    }
    function formatTime(_time) {
        var varMinutes = (Math.floor(_time / 60)).toFixed(0);
        var varSeconds = (((_time / 60) - Math.floor(_time / 60)) * 60).toFixed(0);
        return (varMinutes.length > 1 ? "" : "0") + varMinutes + ":" + ( varSeconds.length > 1 ? "" : "0" ) + varSeconds;
    }
    function _resetScore(_time) {
        $('#timer').html(formatTime(_time));
        $("#score-text").data("value",0);
        $('#score-text').html("0");
        $("#movimientos-text").data("value",0);
        $("#movimientos-text").html("0");
        $('#gameOverTitle').hide();
        $('.panel-score').css("width", "25%");
    }
    function _loadAllCandies() {
        $("[class^='col']").each(
            function (IndexColumn) {
                let candiesLoaded = ($(this).find(".candy").size());
                 for (let var_row=(candiesLoaded+1); var_row <= 7; var_row++) {
                     let candy = _loadCandy((Math.floor(Math.random() * (5 - 1)) + 1), var_row, (IndexColumn + 1));
                     $(this).prepend(candy);
                     candy.addClass("newCandy");
                 }
                $(this).find("div").each(
                    function (i) {
                        $(this).data("row",(i+1));
                    }

                );

            }
        );
         if (gameInit == false) {
                 if (_AutoplayCandiesMatched()){
                         $(".candyAutoplay").remove();
                         _loadAllCandies()
                 }
         }else{
                if ($(".newCandy").size() > 0){
                    $(".newCandy").animate({top:-500},0).animate({top:0},"slow");
                    $(".newCandy").promise().done(
                        function () {
                            if (_AutoplayCandiesMatched()) {
                                $(".candyAutoplay").fadeTo(300,0).fadeTo(300,1).fadeTo(300,0).fadeTo(300,1).hide(300);
                                $(".candyAutoplay").promise().done(
                                    function () {
                                    $(".candyAutoplay").remove();
                                    _loadAllCandies();
                                    }
                                );
                            }
                        }

                    );

                }
         }
        $(".newCandy").removeClass("newCandy");
    }
    function _loadCandy(typeOfCandy, row, column) {
        let candy = $("<div class='candy candy" + typeOfCandy + "'></div>");
        candy.data({"column":column,"row":row,"typeOfCandy":typeOfCandy});
        _setDragAndDrop(candy);
        return candy;
    }
    function _AutoplayCandiesMatched(){
        $(".candy").each(
            function () {
                _candiesMatched(this,"candyAutoplay");
            }
        );
        let candiesMatched = $(".candyAutoplay").size();
        if (candiesMatched>0){
            _setScored(candiesMatched*100);
            return true;
        }else{
            return false;
        }
    }
    function _setDragAndDrop(candy) {
        candy.draggable(
            {
                revert: "invalid",
                containment: "#panel-wrapper",
                scroll: false
            });
        candy.droppable();
        candy.droppable("disable");
        candy.on("mousedown", _setDroppableZone);
    }
    function _setDroppableZone() {
        $(".candy").droppable("option", "disabled", true);
        $(".candy").removeClass("CandySelect");
        $(this).addClass("CandySelect");
        var column = $(this).data("column");
        var row = $(this).data("row");
        _setDroppable($('.col-' + (column + 1)).find('div').eq(row-1));
        _setDroppable($('.col-' + (column - 1)).find('div').eq(row-1));
        _setDroppable($('.col-' + column).find('div').eq((row - 2<0?10:(row -2))));
        _setDroppable($('.col-' + column).find('div').eq(row));
    }
    function _setDroppable(element) {
        element.droppable(
            {
                disabled: false,
                accept: ".CandySelect",
                drop: function (event, ui) {
                    var candyA = _loadCandy(
                        ui.draggable.data("typeOfCandy"),
                        $(this).data("row"),
                        $(this).data("column")
                    );
                    var moveDirection = _getMoveDirection(ui.draggable);
                    candyA.insertAfter(this);
                    var candyB = _loadCandy(
                        $(this).data("typeOfCandy"),
                        ui.draggable.data("row"),
                        ui.draggable.data("column")
                    );
                    candyB.css({"top": ui.draggable.css("top"), "left": ui.draggable.css("left")});
                    candyB.insertAfter(ui.draggable);
                    candyB.animate({"top": 0, "left": 0}, "fast");
                    $(this).detach();
                    $(ui.draggable).detach();
                    var matchedCandyA = _candiesMatched(candyA,"candyMatched");
                    var matchedCandyB = _candiesMatched(candyB,"candyMatched");
                    if (matchedCandyA.valid || matchedCandyB.valid) {
                        setPlayedCount();
                        _setScored(matchedCandyA.points + matchedCandyB.points);
                        $(candyB).promise().done(function() {
                            $(".candyMatched").fadeTo(300,0).fadeTo(300,1).fadeTo(300,0).fadeTo(300,1).hide(300);
                            $(".candyMatched").promise().done(function () {
                                $(".candyMatched").remove();
                                _loadAllCandies();
                            });
                        });
                    }else{
                        $(this).insertAfter(candyA);
                        $(ui.draggable).css(_getPositionRollback(moveDirection));
                        $(ui.draggable).insertAfter(candyB);
                        candyA.remove();
                        candyB.remove();
                        $(ui.draggable).animate({"top": 0, "left": 0}, 500);
                     }
                }
            });
    }
    function _candiesMatched(candy,cssSelector){
        let column = $(candy).data("column");
        let row = $(candy).data("row");
        var matched = {"valid":false,"points":0};
        let candyLeft = $(".col-"+(column-1)).find("div").eq(row-1);
        let candyLeftLeft = $(".col-"+(column-2)).find("div").eq(row-1);
        let candyRight = $(".col-"+(column+1)).find("div").eq(row-1);
        let candyRightRight = $(".col-"+(column+2)).find("div").eq(row-1);
         if ($(candy).data("typeOfCandy") == $(candyRight).data("typeOfCandy")    &&   $(candy).data("typeOfCandy") == $(candyLeft).data("typeOfCandy") ){
             $(candy).addClass(cssSelector);
             $(candyRight).addClass(cssSelector);
             $(candyLeft).addClass(cssSelector);
             matched.valid = true;
             matched.points =+ 100;
         }
         if ( $(candy).data("typeOfCandy") == $(candyLeft).data("typeOfCandy")    &&   $(candy).data("typeOfCandy") == $(candyLeftLeft).data("typeOfCandy") ){
            $(candy).addClass(cssSelector);
            $(candyLeft).addClass(cssSelector);
            $(candyLeftLeft).addClass(cssSelector);
             matched.valid = true;
             matched.points =+ 500;
         }
        if ( $(candy).data("typeOfCandy") == $(candyRight).data("typeOfCandy")   &&   $(candy).data("typeOfCandy") == $(candyRightRight).data("typeOfCandy") ){
            $(candy).addClass(cssSelector);
            $(candyRight).addClass(cssSelector);
            $(candyRightRight).addClass(cssSelector);
            matched.valid = true;
            matched.points =+ 500;
         }
        let candyBefore = $(".col-"+(column)).find("div").eq((row - 2<0?10:(row -2)));
        let candyBeforeBefore = $(".col-"+(column)).find("div").eq((row - 3<0?10:(row -3)));
        let candyAfter = $(".col-"+(column)).find("div").eq(row);
        let candyAfterAfter = $(".col-"+(column)).find("div").eq(row+1);
        if ($(candy).data("typeOfCandy") == $(candyBefore).data("typeOfCandy")    &&   $(candy).data("typeOfCandy") == $(candyAfter).data("typeOfCandy") ){
            $(candy).addClass(cssSelector);
            $(candyBefore).addClass(cssSelector);
            $(candyAfter).addClass(cssSelector);
            matched.valid = true;
            matched.points =+ 100;
        }
        if ( $(candy).data("typeOfCandy") == $(candyBefore).data("typeOfCandy")    &&   $(candy).data("typeOfCandy") == $(candyBeforeBefore).data("typeOfCandy") ){
            $(candy).addClass(cssSelector);
            $(candyBefore).addClass(cssSelector);
            $(candyBeforeBefore).addClass(cssSelector);
            matched.valid = true;
            matched.points =+ 500;
        }
        if ( $(candy).data("typeOfCandy") == $(candyAfter).data("typeOfCandy")   &&   $(candy).data("typeOfCandy") == $(candyAfterAfter).data("typeOfCandy") ){
            $(candy).addClass(cssSelector);
            $(candyAfter).addClass(cssSelector);
            $(candyAfterAfter).addClass(cssSelector);
            matched.valid = true;
            matched.points =+ 500;
        }
        return matched;
    }
    function _getMoveDirection (candy){
        let top = parseInt($(candy).css("top"));
        let left = parseInt($(candy).css("left"));
        if (left<-100){return "left";}
        if (left>100){return "right";}
        if (top>40){return "down";}
        if (top<-40){return "up";}
    }
    function _getPositionRollback(pos) {
        if (pos=="left"){
            return {"left":"-166px","top":"0"}
        }
        if (pos=="right"){
            return {"left":"166px","top":"0"}
        }
        if (pos=="up"){
            return {"left":"0","top":"-96px"}
        }
        if (pos=="down"){
            return {"left":"0","top":"96px"}
        }
    }
    function _setScored(points){
        $("#score-text").data("value",$("#score-text").data("value")+points);
        $("#score-text").html($("#score-text").data("value"));
    }
    function setPlayedCount() {
        $("#movimientos-text").data("value",$("#movimientos-text").data("value")+1);
        $("#movimientos-text").html($("#movimientos-text").data("value"));
    }
    function _setTitleAnimate() {
        $(".main-titulo")
            .animate({color:"white"},100).delay(300)
            .animate({color:"#DCFF0E"},100).delay(800)
            .animate({color:"#white"},100,function () {
                    _setTitleAnimate()
            }
            )
    }
    return {
        init: initialize,
        gameOver: gameOver
    }
})();
$(document).ready(function () {
    $('.btn-reinicio').click(function () {
        game.init(120);
        $(this).text('Reiniciar');
    });
});
