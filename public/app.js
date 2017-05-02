/* global Y, CodeMirror */
(function() {
    // initialize a shared object. This function call returns a promise!
    Y({
    db: {
        name: 'memory'
    },
    connector: {
        name: 'websockets-client',
        room: 'rellat-beaver-project',
        socket: io('http://localhost:3000')
    },
    sourceDir: '/bower_components',
    share: {
        code_editor: 'Text', // y.share.code_editor is of type Y.Text
        dir_tree: 'Map',
        cm_reply: 'Array', // { auth_id, line_num, order_num, level, value }
        chat: 'Array', // { auth_id, value }
        peers: 'Array' // { peer_id, auth_id, name, state}
    }
    }).then(function (y) {
        window.yCodeMirror = y

        // Set CodeMirror
        var ct = document.getElementById("editor");
        var editor = CodeMirror(function(node) {
        ct.parentNode.replaceChild(node, ct);
        }, {
        mode:  "javascript",
        theme: "ambiance",
        lineNumbers: true,
        lineWrapping: true
        });

        // bind the textarea to a shared text element
        y.share.code_editor.bindCodeMirror(editor)
    });
})();
