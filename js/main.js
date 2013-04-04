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

    // Let the user toggle the circle images in the sheet
    $('.consequences img').click(function() {
        if ($(this).attr('src') == 'img/circle.png') {
            $(this).attr('src', 'img/filled_circle.png');
        } else if ($(this).attr('src') == 'img/filled_circle.png') {
            $(this).attr('src', 'img/circle.png');
        }
    });


    // Here's our stress trackers
    var stressTrackers = [
        'phys_stress',
        'ment_stress',
        'soc_stress',
        'hunger_stress'
    ];

    // Activate our stress trackers
    stressTrackers.map(activateStressTracker);


    // Changing the powerLevel picklist triggers a few other fields to change
    $("select[name='powerlevel']").change(function() {
        var selectedVal = parseInt($('option:selected', this).attr('value'));
        var skillCap, skillPoints;
        switch (selectedVal) {
            case -1:
                $('#custom_fate').slideDown('fast');
                break;
            default:// case 6
                skillCap = 'Great (+4)';
                skillPoints = '20';
                updatePowerLevel(skillCap, skillPoints, selectedVal);
                $('#custom_fate').slideUp('fast');
                break;
            case 7:
                skillCap = 'Great (+4)';
                skillPoints = '25';
                updatePowerLevel(skillCap, skillPoints, selectedVal);
                $('#custom_fate').slideUp('fast');
                break;
            case 8:
                skillCap = 'Superb (+5)';
                skillPoints = '30';
                updatePowerLevel(skillCap, skillPoints, selectedVal);
                $('#custom_fate').slideUp('fast');
                break;
            case 10:
                skillCap = 'Superb (+5)';
                skillPoints = '35';
                updatePowerLevel(skillCap, skillPoints, selectedVal);
                $('#custom_fate').slideUp('fast');
                break;
        }
    });

    /*
     * Detects changes in all text fields which get copied to other fields
     * It is easiest to just acknowledge changes in any input.
     * No textarea contains text that get copied
     */
    $("input").change(function() {

        // Classes (key side) represent targets to fill with code from inputs (value side)
        var dupFields = [
            [$('.char_name'), getInputValue('character')],
            [$('.player_name'), getInputValue('player')],
            [$('.high_concept'), getInputValue('high_concept')],
            [$('.trouble'), getInputValue('trouble')]
        ];

        for (pair in dupFields) {
            dupFields[pair][0].html(dupFields[pair][1]);
        }

        // Sums up refresh cost counts of powers & stunts in bottom field
        var refreshCostCount = 0;
        $(".stunts input[name$='cost']").each(function() {
            var inputValue = parseInt($(this).val());
            if (!isNaN(inputValue)) {
                refreshCostCount += parseInt($(this).val());
            }
        });
        $("#tot_stunt_refresh").html(refreshCostCount);
        updateAdjustedRefresh();
        updateSkillPointsRemaining();
    });

    $('#custom_fate input').change(function() {
        updatePowerLevel(
            getInputValue('cust_skill_cap'),
            getInputValue('cust_total_skills'),
            getInputValue('cust_base_refresh')
        );
    });


    // For the purpose of filling default values, simulate a change
    $('input').trigger('change');
    $('select').trigger('change');

    /*
     * Give the checkboxes their functionality
     * This needs to happen after our default values are filled or else the
     * checkboxes simply won't appear in the DOM
     */
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
    storeData();
});

/*
 * This function activates features in #floatingcontroller that allow the user
 * to manage max stress and deal stress damage.
 */
function activateStressTracker(name) {
    var source = "input[name='max_" + name + "']";
    var target = "#" + name;
    var control = "#control_" + name;
    if (!$(source).val()) {
        $(source).val('8');
    }
    $(source).change(function() {
        $(target).empty();
        $(control).empty();
        if ($(this).val() == 0) {
            $('.' + name).css('display', 'none');
        } else {
            $('.' + name).css('display', 'block');
            for (var i = 0; i < $(this).val(); i++) {
                $(target).append('<img src="img/circle.png" /> ');
                var checkboxName = name + 'box' + i
                $(control).append('<input type="checkbox" name="' + checkboxName + '" /> ');
            }
        }
    });
}

// This function positions or unfixes the #floatingcontroller section.
function positionController() {
    var widthTarget = 322;

    // Find how far the left bleed edge is from the window edge
    var bleedLeftOffset = $('.bleed').offset().left;
    var controller = $('#floatingcontroller');
    controller.width(widthTarget);

    if (bleedLeftOffset > (widthTarget / 2) && bleedLeftOffset < widthTarget) {
        // This is a case where we will display 1-column controller (specifically useful for 720p screens)
        controller.width((widthTarget / 2) + 10); // +10 to add padding for visible scrollbar
        controller.removeClass('clearfix');
        controller.addClass('controllerFloats');
        controller.css('left', bleedLeftOffset - controller.outerWidth() + 'px');
        controller.css('overflow-y', 'scroll');
    }
    else if (bleedLeftOffset < widthTarget) {
        // This is a case for a window too narrow for any fixed display
        controller.addClass('clearfix');
        controller.removeClass('controllerFloats');
        controller.css('overflow-y', 'visible');
        controller.css('width', '73%');
    } else {
        // This is the case for dispalys that have proper widths with 2 columns
        controller.removeClass('clearfix');
        controller.addClass('controllerFloats');
        controller.css('left', bleedLeftOffset - controller.outerWidth() + 'px');
        controller.css('overflow-y', 'visible');
    }
}

/*
 * Updated the Adjusted Refresh field by adding base reflex to amount spent
 * on stunts/powers, which should be a negative number.
 */
function updateAdjustedRefresh() {
    var adjRefTarget = $("#adj_refresh");
    var baseRef = parseInt($('#base_refresh').text())
    var totStuntRef = parseInt($("#tot_stunt_refresh").text())

    var newAdjRef = baseRef + totStuntRef;

    adjRefTarget.html(newAdjRef);
}

/*
 *  This part is for ounting skill points spent
 *  We'll gather all the inputs in .skills, make an array of their names,
 *  then multiply the number of slots by the corresponding shift to get
 *  the sum of skill points spent.
 */
function updateSkillPointsRemaining() {
    var countSkillSum = 0;
    $('.skills input').each(function() {
        var inputName = $(this).attr('name');
        var multiplier = parseInt(inputName.substr(inputName.length - 1));
        var inputValue = $(this).val();
        countSkillSum += multiplier * inputValue;
    });
    $('#skill_points_spent').html(countSkillSum);
    $('#skill_point_counter p').html(parseInt($('#skill_points').text()) - countSkillSum);
}


// This function executed changes when the user adjusts his power level
function updatePowerLevel(skillCap, skillPoints, baseRefresh) {
    if (!skillPoints) {
        skillPoints = 0;
    }
    if (!baseRefresh) {
        baseRefresh = 0;
    }
    $('#skill_cap').html(skillCap);
    $('#skill_points').html(skillPoints);
    $('#base_refresh').html(baseRefresh);

    updateAdjustedRefresh()
    updateSkillPointsRemaining();
}

// I find myself needing input values based on names altogether too frequently.
function getInputValue(name) {
    return $("input[name='" + name + "']").val();
}

// Pre-fetch image content
function preloadImages(imgArray) {
    $(imgArray).each(function() {
        (new Image()).src = this;
    });
}

// Let's work on storing data
function storeData() {
    $('input, textarea, select').each(function() {
        //console.log($(this).attr('name'));
    });
}
