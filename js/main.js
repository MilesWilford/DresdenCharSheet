$(document).ready(function() {
    $(document).keyup(function() {
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
