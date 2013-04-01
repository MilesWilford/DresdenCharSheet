$(document).ready(function() {
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
