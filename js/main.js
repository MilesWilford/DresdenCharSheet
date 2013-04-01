$(document).ready(function() {
    /* Pre-cache images */
    preloadImages([
        'img/circle.png',
        'img/filled_circle.png'
    ]);

    // Controller section needs to be positioned on load and on resize
    positionController();
    $(window).resize(function() {
        positionController();
    });

    /*
     * Activate all the max stress boxes.
     * To keep code easy to maintain, we use this array to keep track
     * of our trackers
     */
    var stressTrackers = [
        'phys_stress',
        'ment_stress',
        'soc_stress',
        'hunger_stress'
    ];
    for (stresses in stressTrackers) {
        activateStressTracker(stressTrackers[stresses]);
    }

    // Give the checkboxes their functionality
    $("input[type='checkbox']").click(function() {
        for (stresses in stressTrackers) {
            for (i = 0; i < 8; i++) {
                var currentBoxName = stressTrackers[stresses]    + "box" + i;
                var currentImg = "#" + stressTrackers[stresses] + " img:nth-of-type(" + (i + 1) + ")";
                var currentStressbox = "input[name='" + currentBoxName + "']";
                if ($(currentStressbox).is(':checked')) {
                    $(currentImg).after('<img src="img/filled_circle.png" />');
                    $(currentImg).remove();
                } else {
                    $(currentImg).after('<img src="img/circle.png" />');
                    $(currentImg).remove();
                }
            }

        }
    });

    /* Changing the powerLevel picklist triggers a few other fields to change */
    $("select[name='powerlevel']").change(function() {
        var selectedVal = parseInt($('option:selected', this).attr('value'));
        var skillCap, skillPoints;
        switch (selectedVal) {
            case 6:
                skillCap = 'Great (+4)';
                skillPoints = '20';
                break;
            case 7:
                skillCap = 'Great (+4)';
                skillPoints = '25';
                break;
            case 8:
                skillCap = 'Superb (+5)';
                skillPoints = '30';
                break;
            case 10:
                skillCap = 'Superb (+5)';
                skillPoints = '35';
                break;
        }
        $('#skill_cap').html(skillCap);
        $('#skill_points').html(skillPoints);
        $('#base_refresh').html(selectedVal);
    });

    /*
     * Detects changes in all text fields which get copied to other fields
     * It is easiest to just acknoledge changes in any input.
     * No textarea contains text that get copied
     */
    $("input").change(function() {

        //TODO: these two arrays would be better as one associative array
        var dupfields = [];
        dupfields.push($('.char_name'));
        dupfields.push($('.player_name'));
        dupfields.push($('.high_concept'));
        dupfields.push($('.trouble'));

        var dup_source = [];
        dup_source.push($("input[name='character']").val());
        dup_source.push($("input[name='player']").val());
        dup_source.push($("input[name='high_concept']").val());
        dup_source.push($("input[name='trouble']").val());

        if (dupfields.length == dup_source.length) {
            for (x in dupfields) {
                if (dup_source[x]) {
                    dupfields[x].html(dup_source[x]);
                }
            }
        }

        /* Sums up refresh cost counts of powers & stunts in bottom field */
        var refreshCostCount = 0;
        $(".stunts input[name$='cost']").each(function() {
            var inputValue = parseInt($(this).val());
            if (!isNaN(inputValue)) {
                refreshCostCount += parseInt($(this).val());
            }
        });
        $("#tot_stunt_refresh").html(Math.abs(refreshCostCount));
    });
});

/*
 * This function activates features in #floatingcontroller that allow the user
 * to manage max stress and deal stress damage.
 */
function activateStressTracker(name) {
    var source = "input[name='max_" + name + "']";
    var target = "#" + name;
    var control = "#control_" + name;
    $(source).change(function() {
        $(target).empty();
        $(control).empty();
        for (var i = 0; i < $(this).val(); i++) {
            $(target).append('<img src="img/circle.png" /> ');
            var checkboxName = name + 'box' + i
            $(control).append('<input type="checkbox" name="' + checkboxName + '" /> ');
        }
    });
}

// This function positions or unfixes the #floatingcontroller section
function positionController() {
    var widthTarget = 322;
    var controller = $('#floatingcontroller');
    controller.width(widthTarget);
    var controllerWidth = getTrueWidth(controller);
    /*
     * The alignment is half the window innerwidth (the screen midpoint)
     * minus the width of the page wrapper (which I named with the class bleed)
     * minus the width of the controller element including margins and padding
     * minus a fixed nuber (16) which fine-tunes the position
     */
    var controllerAlignment = window.innerWidth / 2
                            - $('.bleed').width() / 2
                            - controllerWidth
                            - 16;

    var availableMargins = window.innerWidth - $('.bleed').width();
    availableMargins /= 2;

    if (availableMargins > controllerWidth / 2 && availableMargins < controllerWidth) {
        /* This is a case where we will display 1-column controller */
        controller.width(controllerWidth / 2);
        controller.removeClass('clearfix');
        controller.addClass('controllerFloats');
        controller.css('overflow-y', 'scroll');
        // To account for the added scrollbar, I had to fine-tune placement with -18
        controller.css('left', controllerAlignment - 18 + (controllerWidth / 2) + 'px');
    }
    else if (availableMargins < controllerWidth) {
        /* This is a case for a window to narrow for any fixed display */
        controller.addClass('clearfix');
        controller.removeClass('controllerFloats');
        controller.css('overflow-y', 'visible');
        controller.css('width', '80%');
    } else {
        /* This is the case for dispalys that have proper widths with 2 columns */
        controller.removeClass('clearfix');
        controller.addClass('controllerFloats');
        controller.css('left', controllerAlignment + 'px');
        controller.css('overflow-y', 'visible');
    }
}

// This function basically gives us box-sizing without browser compat issues
function getTrueWidth(element) {
    var trueWidth = 0;
    trueWidth += (parseInt(element.css('margin-left').replace("px", ""))) * 2;
    trueWidth += (parseInt(element.css('padding-left').replace("px", ""))) * 2;
    trueWidth += element.width();
    return trueWidth;
}

// Pre-fetch image content
function preloadImages(imgArray) {
    $(imgArray).each(function() {
        (new Image()).src = this;
    });
}