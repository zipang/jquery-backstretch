/**
 * Execute the content of the code examples contained in the <code class="runnable"> tags
 */
(function executeCodeExamples() {
    $("code.runnable").each(function() {
        var runnableCode = $(this).text();
        $("<script>", {type: "text/javascript"})
            .text(runnableCode)
            .appendTo("body");
    });
})();
