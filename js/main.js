$(document).ready(function() {
    positionController();

    /* Activate all the max stress boxes */
    var stressTrackers = [
        'phys_stress',
        'ment_stress',
        'soc_stress',
        'hunger_stress'
    ]

    for (stresses in stressTrackers) {
        activateStressTracker(stressTrackers[stresses]);
    }2

    /* Changing the powerLevel triggers a few other fields to change */
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

    /* Detects changes in all text fields which get copied to other fields */
    $("input").change(function() {
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

function positionController() {
    var controller = $('#floatingcontroller');
    var controllerWidth = getTrueWidth(controller);
    var controllerAlignment = window.innerWidth / 2
                            - $('.bleed').width() / 2
                            - controllerWidth
                            - 16;
    var availableMargins = window.innerWidth - $('.bleed').width();
    availableMargins /= 2;
    if (availableMargins > controllerWidth / 2 && availableMargins < controllerWidth) {
        controller.width(controllerWidth / 2);
        controller.removeClass('clearfix');
        controller.addClass('controllerFloats');
        controller.css('overflow-y', 'scroll');
        controller.css('left', controllerAlignment - 18 + (controllerWidth / 2) + 'px');
    }
    else if (availableMargins < controllerWidth) {
        console.log('Viewport too narrow, controller will not float fixed.');
        controller.css('position', 'static');
        controller.css('max-width', 'none');
    } else {
        controller.removeClass('clearfix');
        controller.addClass('controllerFloats');
        controller.css('left', controllerAlignment + 'px');
    }
}

function getTrueWidth(element) {
    var trueWidth = 0;
    trueWidth += (parseInt(element.css('margin-left').replace("px", ""))) * 2;
    trueWidth += (parseInt(element.css('padding-left').replace("px", ""))) * 2;
    trueWidth += element.width();
    return trueWidth;
}
