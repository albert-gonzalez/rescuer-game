define([
    'jquery',
    'underscore',
    'rescuer/js/game',
    'rescuer/js/title',
    'rescuer/js/score',
    'easeljs',
    'soundjs',
    'preloadjs',
], function ($, _, Game, Title, Score) {
    'use strict';

    var ORIGINAL_SCALE_WIDTH = 550,
        MAX_WIDTH = 1024,
        SCREEN_RATIO = 16 / 9,
        MIN_WIDTH = 240,

        manifest = [
            {src: "images/characters/lemmings.png", id: "characters"},
            {src: "images/objects/gate.png", id: "gate"},
            {src: "images/levels/ground.png", id: "ground"}
        ],
        loader,
        stage,
        game,
        title,
        score;

    function initStage() {
        stage = new createjs.Stage("game");
        stage.enableMouseOver(10);
        updateStageSizes();
    }

    function showScoreView(rescuedCount) {
        score.show(rescuedCount);
    }

    function saveHighscore(rescuedCount) {
        if(typeof(Storage) !== "undefined") {
            if (localStorage.getItem('rescuerHS') === null ||  localStorage.getItem('rescuerHS') < rescuedCount) {
                localStorage.setItem('rescuerHS', rescuedCount);
            }
        }
    }

    function startNewGame() {
        stage.removeChild(title.screen);
        if (game) {
            stage.removeChild(game.screen);
        }
        game = new Game(stage, loader);
        game.init();
        stage.addChild(game.screen);
        game.screen.addEventListener('ended', function (event) {
            showScoreView(event.rescuedCount);
            saveHighscore(event.rescuedCount);
        });
    }

    function initTitle() {
        title = new Title(stage, loader);
        title.init();
        title.newGameText.addEventListener('click', startNewGame);
    }

    function initScoreView() {
        score = new Score(stage.canvas);
        score.addEventListener('playAgain', startNewGame);
    }

    function updateStageSizes() {
        var containerWidth = $(stage.canvas).parent().width();
        var width = MIN_WIDTH > containerWidth ? MIN_WIDTH : containerWidth;
        width = width < MAX_WIDTH? width : MAX_WIDTH;
        stage.canvas.width = width;
        stage.canvas.height =stage.canvas.width / SCREEN_RATIO;
        stage.scaleX = stage.canvas.width / ORIGINAL_SCALE_WIDTH;
        stage.scaleY = stage.scaleX;
    }

    function resize() {
        updateStageSizes();
        if (game !== undefined) {
            game.updateSizes();
        }
        if (title !== undefined) {
            title.updateSizes();
        }
        if (score !== undefined && score.$content !== undefined) {
            score.updateSizes();
        }
    }

    function initTicker() {
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.addEventListener("tick", updateScreen);
    }

    function updateScreen(event) {
        stage.update(event);
    };

    function init() {
        initStage();
        initTitle();
        initScoreView();
        initTicker();
        stage.addChild(title.screen);
        window.addEventListener('resize', resize, false);
    }

    loader = new createjs.LoadQueue(false);
    loader.addEventListener("complete", init);
    loader.loadManifest(manifest, true, "src/rescuer/media/");
});
