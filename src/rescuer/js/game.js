define([
    'easytimerjs', 'underscore', 'rescuer/js/character.factory', 'easeljs', 'soundjs', 'preloadjs',
], function (Timer, _, characterFactory) {
    'use strict';

    function Game(stage, loader) {
        var MIN_CHANCE_OF_ADD_CHARACTER = 0.015,
            DIVISOR_RESCUED = 12000,
            INIT_LIFES = 3,
            TEXT_VERTICAL_MARGIN = 10,
            HUD_HORIZONTAL_MARGIN = 10,
            HUD_VERTICAL_MARGIN = 10,
            LEVEL_HORIZONTAL_MARGIN = 100,
            CHARACTER_FAST_SPEED = 75,
            CHARACTER_SLOW_SPEED = 50;

        this.manifest = [
            {src: "images/characters/lemmings.png", id: "characters"},
            {src: "images/objects/gate.png", id: "gate"},
            {src: "images/levels/ground.png", id: "ground"}
        ];

        function calculateChanceOfNewCharacter(rescuedCount) {
            return MIN_CHANCE_OF_ADD_CHARACTER + rescuedCount / DIVISOR_RESCUED;
        }

        function hasToAddCharacter(rescuedCount) {
            return Math.random() < calculateChanceOfNewCharacter(rescuedCount);
        }

        this.stage = stage;
        this.loader = loader;

        this.init = function () {
            characterFactory.init(this.loader);
            this.charactersInDistress = [];
            this.initSpriteSheets();
            this.updateSizes();
            this.initLevel();
            this.initHud();
            this.screen = new createjs.Container();
            this.screen.addChild(this.level, this.hud);
            this.initTicker();

            this.timer = new Timer();

        this.rescuedCount = 0;

            this.timer.start({precision: 'seconds'});
            this.timer.addEventListener('secondsUpdated', _.bind(this.updateTime, this));
        };

        this.initSpriteSheets = function () {
            this.gateSpriteSheet = new createjs.SpriteSheet({
                framerate: 8,
                "images": [this.loader.getResult("gate")],
                "frames": {"regX": 68, "height": 101, "count": 60, "regY": 0, "width": 136},
                "animations": {
                    'gate': [0, 5, "gate"]
                }
            });
        };

        this.initLevel = function () {
            var groundImg = this.loader.getResult("ground");
            this.ground = new createjs.Shape();
            this.ground.graphics.beginBitmapFill(groundImg).drawRect(0, 1, this.width, groundImg.height);
            this.ground.tileW = groundImg.width;
            this.ground.tileH = groundImg.height;
            this.ground.y = this.height - groundImg.height;

            this.gate = new createjs.Sprite(this.gateSpriteSheet, "gate");
            this.gate.x = this.width / 2;
            this.gate.y = this.height - this.gate.getBounds().height - groundImg.height +  30;

            this.level = new createjs.Container();
            this.level.addChild(this.ground, this.gate);
        };

        this.initHud = function () {
            this.timeText = new createjs.Text("Time: 0", "12px 'Press Start 2P'", "#dddddd");
            this.timeText.x = HUD_HORIZONTAL_MARGIN;
            this.timeText.y = HUD_VERTICAL_MARGIN;

            this.rescuedCountText = new createjs.Text("Rescued: 0", "12px 'Press Start 2P'", "#dddddd");
            this.rescuedCountText.x = HUD_HORIZONTAL_MARGIN;
            this.rescuedCountText.y = this.timeText.y + this.timeText.getBounds().height + TEXT_VERTICAL_MARGIN;

            this.lifesText = new createjs.Text("Lifes:", "12px 'Press Start 2P'", "#dddddd");
            this.lifesText.font = "12px 'Press Start 2P'";
            this.lifesText.x = HUD_HORIZONTAL_MARGIN;
            this.lifesText.y = this.rescuedCountText.y + this.rescuedCountText.getBounds().height + TEXT_VERTICAL_MARGIN;

            this.lifeCount = INIT_LIFES;
            this.lifes = [];

            this.hud = new createjs.Container();

            this.hud.addChild(this.timeText, this.rescuedCountText, this.lifesText);
            var i, life;
            for (i = 0; i< this.lifeCount; i++) {
                life = new characterFactory.createCharacter('life');
                life.scaleX = life.scaleX * 0.50;
                life.scaleY = life.scaleY * 0.50;
                life.y = this.lifesText.y - life.getBounds().height / 2.5 * life.scaleY;
                life.x = this.lifesText.x + this.lifesText.getBounds().width + life.getBounds().width / 2 * life.scaleX  + (life.getBounds().width / 2 * i * life.scaleX);
                this.hud.addChild(life);
                this.lifes.push(life);
            }
        };

        this.initTicker = function () {
            createjs.Ticker.timingMode = createjs.Ticker.RAF;
            createjs.Ticker.addEventListener("tick", this.updateCanvas);
        };

        this.updateCanvas = _.bind(function (event) {
            this.updateHud();
            this.updateCharactersInDistress(event.delta / 1000);
            this.endGameIfNoLifesLeft();
        }, this);

        this.updateTime = _.bind(function (event) {
            this.timeText.text = 'Time: ' + this.timer.getTotalTimeValues().seconds;
        }, this);

        this.updateHud = function () {
            this.rescuedCountText.text = 'Rescued: ' + this.rescuedCount;
        };

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
                speed = characterInDistress.currentAnimation === 'fall'? CHARACTER_FAST_SPEED : CHARACTER_SLOW_SPEED;
                var position = characterInDistress.y + speed * elapsedTime;
                var characterHeight = characterInDistress.getBounds().height;
                characterInDistress.y = position;
                if (position >= this.height - characterHeight) {
                    characterInDistress.y = this.height - characterHeight;
                    if (characterInDistress.currentAnimation === 'fall') {
                        characterInDistress.die(_.bind(this.removeCharacterInDistress, this));
                        this.discountLife();
                    } else {
                        characterInDistress.gotoAndPlay('walk');
                    }
                }
            } else if (characterInDistress.isWalking()) {
                if (characterInDistress.x > this.gate.x) {
                    characterInDistress.scaleX = -1;
                    characterInDistress.x -= CHARACTER_SLOW_SPEED * elapsedTime;
                } else {
                    characterInDistress.scaleX = 1;
                    characterInDistress.x += CHARACTER_SLOW_SPEED * elapsedTime;
                }

                if (characterInDistress.x <= this.gate.x + 5 && characterInDistress.x >= this.gate.x - 5) {
                    characterInDistress.x = this.gate.x;
                    characterInDistress.escape(_.bind(this.removeCharacterInDistress, this));
                }
            }
        };

        this.endGameIfNoLifesLeft = function () {
            if (this.lifeCount === 0) {
                createjs.Ticker.removeEventListener('tick', this.updateCanvas);
                this.timer.stop();
                var event = new createjs.Event('ended');
                event.rescuedCount = this.rescuedCount;
                this.screen.dispatchEvent(event);
            }
        }

        this.discountLife = function () {
            this.hud.removeChild(this.lifes[this.lifes.length - 1]);
            this.lifes.pop();
            this.lifeCount = this.lifes.length;
        }

        this.removeCharacterInDistress = function (character) {
            this.level.removeChild(character);
            character.readyToRemove = true;
        };

        this.saveCharacterInDistress = function(character) {
            character.gotoAndPlay('openUmbrella');
            character.removeAllEventListeners();
            character.hitArea = new createjs.Shape();
            this.rescuedCount += 1;
        };

        this.addCharacterInDistress = function () {
            var character = characterFactory.createCharacter('fall'),
                that = this;
            character.x =Math.floor(LEVEL_HORIZONTAL_MARGIN + (Math.random() * (this.width - LEVEL_HORIZONTAL_MARGIN * 2)));
            character.y = - character.getBounds().height;
            character.addEventListener('click', function (event) {
                that.saveCharacterInDistress(event.target);
            });
            character.cursor = 'pointer';
            this.level.addChild(character);
            this.charactersInDistress.push(character);
        };

        this.updateSizes = function () {
            this.width = stage.canvas.width / stage.scaleX;
            this.height = stage.canvas.height / stage.scaleY;
        }
    }

    return Game;

});
