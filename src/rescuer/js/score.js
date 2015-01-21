define([
    'jquery', 'sharebutton', 'text!rescuer/templates/score.window.html', 'easeljs'
], function ($, Share, scoreWindowTemplate) {
    function ScoreWindow(canvas) {
        this.canvas = canvas;
    }

    createjs.EventDispatcher.initialize(ScoreWindow.prototype);

    ScoreWindow.prototype.show = function (rescuedCount) {
        var $canvas = $(this.canvas),
            _this = this;

        this.$content = $(scoreWindowTemplate);
        this.rescuedCount = rescuedCount || 0;

        this.updateSizes();
        this.$content.find('.rescuedCount').html(this.rescuedCount);
        this.$content.find('.playAgain').click(function () {
            _this.dispatchEvent('playAgain');
            _this.close();
        });
        $canvas.before(this.$content);
        new Share(".shareButton", {
            description: 'I just rescued ' + this.rescuedCount + ' lemmings on Rescuer Game!'
        });
        this.$content.fadeIn(500);
    }

    ScoreWindow.prototype.close = function () {
        this.$content.fadeOut(500, this.$content.remove);
    }

    ScoreWindow.prototype.updateSizes = function () {
        this.$content.width(this.canvas.width).height(this.canvas.height);
        this.$content.children('.background, .content').height(this.canvas.height);
    }

    return ScoreWindow;
});
