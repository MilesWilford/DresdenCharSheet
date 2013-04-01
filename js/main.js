$(document).ready(function() {
    $(document).keyup(function() {
        $('.char_name').html($("input[name='character']").val());
        $('.player_name').html($("input[name='player']").val());
        $('.high_concept').html($("input[name='high_concept']").val());
        $('.trouble').html($("input[name='trouble']").val());
    });
});
