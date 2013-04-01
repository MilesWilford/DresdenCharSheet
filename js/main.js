$(document).ready(function() {
    $(document).keyup(function() {
        var dupfields = [];
        dupfields.push($('.char_name'));
        dupfields.push($('.player_name'));
        dupfields.push($('.high_concept'));
        dupfields.push($('.trouble'));

        var duptargets = [];
        duptargets.push($("input[name='character']").val());
        duptargets.push($("input[name='player']").val());
        duptargets.push($("input[name='high_concept']").val());
        duptargets.push($("input[name='trouble']").val());

        if (dupfields.length == duptargets.length) {
            for (x in dupfields) {
                dupfields[x].html(duptargets[x]);
            }
        }

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
