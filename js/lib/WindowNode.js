var cirelli = cirelli || {};

cirelli.WindowNode = (function(Node) {
    function WindowNode(title, id) {
        Node.call(this, title, id, true);
    }
    WindowNode.prototype = new Node();
})(cirelli.Node);
