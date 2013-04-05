$(document).ready(function() {
    // Pre-cache images
    [
        'img/circle.png',
        'img/filled_circle.png'
    ].forEach(function(image) {
        (new Image()).src = image;
    });

    // Controller section needs to be positioned on ready *and* on window resize
    positionController();
    $(window).resize(positionController);

    $('input, select').each(function() {
        localStorageGet($(this));
    });

    // Define the stress tracks
    var stressTracks = [
        'phys_stress',
        'ment_stress',
        'soc_stress',
        'hunger_stress'
    ];

    /*
     * Activate our stress trackers
     * This function activates features in #floatingcontroller that allow the user
     * to manage max stress
     */
    stressTracks.forEach(function(name) {
        var source = "input[name='max_" + name + "']";
        var target = "#" + name;
        if (!$(source).val()) {
            $(source).val('8');
        }

        for (var i = 0; i < 8; i++) {
            $(target).append('<div></div>');
        }

        $(source).change(function() {
            if ($(this).val() == 0) {
                $('.' + name).css('display', 'none');
            } else {
                $('.' + name).css('display', 'block');
                $(target + ' div').removeClass('imgRadioActive');
                for (var i = 0; i < $(this).val(); i++) {
                    $(target + ' div:nth-of-type(' + (i + 1) + ')').addClass('imgRadioActive');
                }
            }
        });
    });


    // Changing the powerLevel picklist triggers a few other fields to change
    $("select[name='powerlevel']").change(function() {
        var selectedVal = parseInt($('option:selected', this).attr('value'));
        switch (selectedVal) {
            case -1:
                $('#custom_fate').slideDown('fast');
                break;
            default:// case 6
                updatePowerLevel(skillLevelForShift(4), 20, selectedVal);
                $('#custom_fate').slideUp('fast');
                break;
            case 7:
                updatePowerLevel(skillLevelForShift(4), 25, selectedVal);
                $('#custom_fate').slideUp('fast');
                break;
            case 8:
                updatePowerLevel(skillLevelForShift(5), 30, selectedVal);
                $('#custom_fate').slideUp('fast');
                break;
            case 10:
                updatePowerLevel(skillLevelForShift(5), 35, selectedVal);
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
        /*
         * place a class that will accept the value in key (left) position
         * and an input name to take the value from in the value (right) position
         */
        [
            ['.char_name', 'character'],
            ['.player_name', 'player'],
            ['.high_concept', 'high_concept'],
            ['.trouble', 'trouble']
        ].forEach(function(args) {
            $(args[0]).html(inputValueOf(args[1]));
        });

        // Sums up refresh cost counts of powers & stunts in bottom field
        var refreshCostCount = 0;
        // The fields are named consistently, in the form stunt_n_cost
        $(".stunts input[name$='cost']").each(function() {
            var inputValue = parseInt($(this).val());
            // Double-check that there is an actual number here, otherwise we can treat it as 0
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
            inputValueOf('cust_skill_cap'),
            inputValueOf('cust_total_skills'),
            inputValueOf('cust_base_refresh')
        );
    });


    $('input, select').change(function() {
        localStorageStash($(this));
    });

    // For the purpose of filling default values, simulate a change
    $('input').trigger('change');
    $('select').trigger('change');

    $("*[type='reset']").click(function() {
        localStorage.clear();
        location.reload();
    });

    // Let the user toggle the circle images in the sheet by clickinn the divs
    // this must be placed after all defaults are filled.
    $('div.imgRadioActive').click(function() {
        $(this).toggleClass('imgRadioMarked');
    });
});

// These two functions used to save & load character (persist data)
function localStorageStash(jQInput) {
    if (localStorage && jQInput.val() && jQInput.attr('name')) {
        localStorage[jQInput.attr('name')] = jQInput.val();
    }
}

function localStorageGet(jQInput) {
    if (localStorage[jQInput.attr('name')]) {
        jQInput.val(localStorage[jQInput.attr('name')]);
    }
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
        controller.css({
            'left' : bleedLeftOffset - controller.outerWidth() + 'px',
            'overflow-y' : 'scroll'
        });
    }
    else if (bleedLeftOffset < widthTarget) {
        // This is a case for a window too narrow for any fixed display
        controller.addClass('clearfix');
        controller.removeClass('controllerFloats');
        controller.css({
            'overflow-y' : 'visible',
            'width' : '73%'
        });
    } else {
        // This is the case for dispalys that have proper widths with 2 columns
        controller.removeClass('clearfix');
        controller.addClass('controllerFloats');
        controller.css({
            'left' : bleedLeftOffset - controller.outerWidth() + 'px',
            'overflow-y' : 'visible'
        });
    }
}

/*
 * Updates the Adjusted Refresh field by adding base reflex to amount spent
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
 *  TODO: would this by better achieved with a reduce()?
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
function updatePowerLevel(skillCapInt, skillPoints, baseRefresh) {
    skillPoints = !skillPoints ? 0 : skillPoints;
    baseRefresh = !baseRefresh ? 0 : baseRefresh;

    $('#skill_cap').html(skillCapInt);
    $('#skill_points').html(skillPoints);
    $('#base_refresh').html(baseRefresh);

    updateAdjustedRefresh()
    updateSkillPointsRemaining();
}

// Takes shifts (in int) and returns named skill cap based on terms in #ladder_definition
function skillLevelForShift(shiftInt) {
    // First build array of terms
    var ladder_terms = $.makeArray($('#ladder_definition dt').map(function() {
        return $(this).text();
    }));

    // Lowest value is -2, not 0, so we must adjust the input
    var shiftIntArrayPos = shiftInt + 2;

    // Fail on otherwise-undefined values
    if (shiftIntArrayPos > ladder_terms.length || shiftIntArrayPos < 0) {
        return false;
    }

    // Terms were stored backwards
    ladder_terms.reverse();

    var symbol = shiftInt >= 0 ? "+" : "";

    return ladder_terms[shiftIntArrayPos] + ' (' + symbol + shiftInt + ')';
}

// I find myself needing input values based on names altogether too frequently.
function inputValueOf(name) {
    return $("input[name='" + name + "']").val();
}