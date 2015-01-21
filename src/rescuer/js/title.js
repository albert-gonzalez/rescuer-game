define([
    'underscore', 'rescuer/js/character.factory', 'easeljs', 'soundjs', 'preloadjs'
], function (_, characterFactory) {
    'use strict';

    function Title(stage, loader) {
        var MIN_CHANCE_OF_ADD_CHARACTER = 0.005,
            TEXT_VERTICAL_MARGIN = 10,
            CHARACTER_SLOW_SPEED = 50;

        this.stage = stage;
        this.loader = loader;

        function hasToAddCharacter() {
            return Math.random() < MIN_CHANCE_OF_ADD_CHARACTER;
        }

        this.init = function () {
            this.charactersInDistress = [];
            this.updateSizes();
            this.screen = new createjs.Container();
            this.initTexts();
            var hit = new createjs.Shape();
            hit.graphics.beginFill("#FFF").drawRect(0, 0, this.newGameText.getBounds().width, this.newGameText.getBounds().height);
            this.newGameText.hitArea = hit;
            characterFactory.init(this.loader);
            this.initTicker();
        };

        this.initTexts = function () {
            this.initTitleText();
            this.initNewGameText();
            this.initHighscoreText();
        };

        this.initTitleText = function () {
            this.titleText = new createjs.Text("Rescuer", "50px 'Press Start 2P'", "#fd4033");
            this.titleText.x = this.stage.canvas.width /this.stage.scaleX / 2 - this.titleText.getBounds().width / 2;
            this.titleText.y = this.stage.canvas.height / 10;
            this.screen.addChild(this.titleText);
        };

        this.initNewGameText = function () {
            var that = this;
            this.newGameText = new createjs.Text("New Game", "24px 'Press Start 2P'", "#dddddd");
            this.newGameText.x = this.stage.canvas.width /this.stage.scaleX / 2 - this.newGameText.getBounds().width / 2;
            this.newGameText.y = this.stage.canvas.height /this.stage.scaleY - this.stage.canvas.height /this.stage.scaleY / 3;
            this.newGameText.cursor = 'pointer';
            this.newGameText.addEventListener("mouseover", function() {
                that.newGameText.color = '#d0cca0';
            });
            this.newGameText.addEventListener("mouseout", function() {
                that.newGameText.color = '#dddddd';
            });
            this.screen.addChild(this.newGameText);
        };

        this.initHighscoreText = function () {
            var highscore = this.getHighscore();
            if (highscore) {
                this.highScoreText = new createjs.Text("HIGHSCORE: " + this.getHighscore(), "12px 'Press Start 2P'", "#dddddd");
                this.highScoreText.x = this.stage.canvas.width /this.stage.scaleX / 2 - this.highScoreText.getBounds().width / 2;
                this.highScoreText.y = this.newGameText.y + this.newGameText.getBounds().height + TEXT_VERTICAL_MARGIN;
                this.screen.addChild(this.highScoreText);
            }
        };

        this.initTicker = function () {
            createjs.Ticker.timingMode = createjs.Ticker.RAF;
            createjs.Ticker.addEventListener("tick", this.updateCanvas);
        };

        this.updateCanvas = _.bind(function (event) {
            this.updateCharactersInDistress(event.delta / 1000);
        }, this);

        this.getHighscore = function () {
            if(typeof(Storage) !== "undefined") {
                return localStorage.getItem('rescuerHS');
            }
        }

        this.updateCharactersInDistress = function(elapsedTime) {
            var that = this;

            if (hasToAddCharacter(this.rescuedCount)) {
                this.addCharacterInDistress();
            }

            _.each(this.charactersInDistress, function (characterInDistress) {
                that.updateCharacterInDistress(characterInDistress, elapsedTime);
            });

            this.charactersInDistress = _.reject(this.charactersInDistress, function (characterInDistress) {
                return characterInDistress.readyToRemove;
            });
        };

        this.updateCharacterInDistress = function(characterInDistress, elapsedTime) {
            var that = this,
                speed;

            if (characterInDistress.isFalling()) {
                speed = CHARACTER_SLOW_SPEED;
                var position = characterInDistress.y + speed * elapsedTime;
                var characterHeight = characterInDistress.getBounds().height;
                characterInDistress.y = position;
                if (position >= this.height + characterHeight) {
                    this.removeCharacterInDistress(characterInDistress);
                }
            }
        };

        this.removeCharacterInDistress = function (character) {
            this.screen.removeChild(character);
            character.readyToRemove = true;
        };

        this.addCharacterInDistress = function () {
            var character = characterFactory.createCharacter('umbrella'),
                that = this;
            character.x = Math.floor((Math.random() * this.width));
            character.y = - character.getBounds().height;

            this.screen.addChild(character);
            this.charactersInDistress.push(character);
        };

        this.updateSizes = function () {
            this.width = stage.canvas.width / stage.scaleX;
            this.height = stage.canvas.height / stage.scaleY;
        };
    }

    return Title;
});
