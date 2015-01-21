define([
    'underscore', 'easeljs', 'soundjs', 'preloadjs'
], function (_) {
    'use strict';

    var characterSpriteSheet;

    return {
        init: function (loader) {
            characterSpriteSheet = new createjs.SpriteSheet({
                framerate: 8,
                "images": [loader.getResult("characters")],
                "frames": {"regX": 40, "height": 80, "count": 60, "regY": 0, "width": 80},
                "animations": {
                    'walk': [0, 7, 'walk'],
                    'fall': [30, 33, 'fall'],
                    'openUmbrella': [34, 38, 'umbrella'],
                    'umbrella': [39, 40, 'umbrella'],
                    'dead': [45, 60],
                    'escape': [15, 22],
                    'life': [3, 3, false]
                }
            });
        },

        createCharacter: function (animation) {
            var defaultAnimation = 'fall',
                character,
                hit;
            animation = animation || defaultAnimation;
            character =  new createjs.Sprite(characterSpriteSheet, animation);
            character = _.extend(character, {
                isFalling: function () {
                    return this.currentAnimation === 'fall'
                        || this.currentAnimation === 'umbrella'
                        || this.currentAnimation === 'openUmbrella';
                },

                isWalking: function () {
                    return this.currentAnimation === 'walk';
                },

                die: function (callback) {
                    callback = callback || function () {};
                    this.removeAllEventListeners();
                    this.gotoAndPlay('dead');
                    this.addEventListener('animationend', function (event) {
                        callback(event.target);
                    });
                },

                escape: function (callback) {
                    callback = callback || function () {};
                    this.scaleX = 1;
                    this.gotoAndPlay('escape');
                    this.addEventListener('animationend', function (event) {
                        callback(event.target);
                    });
                }
            });

            hit = new createjs.Shape();
            hit.graphics.beginFill("#FFF").drawRect(-character.getBounds().width / 2, 0, character.getBounds().width / 2, character.getBounds().height);
            character.hitArea = hit;

            return character;
        }
    };
});
