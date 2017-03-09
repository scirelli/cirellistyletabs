var cirelli = cirelli || {};

cirelli.TreePanelNode = class TreePanelNode {
    constructor(title, data) {
        this.title = title || '';
        this.children = [];
        this.data = undefined;
    }

    add(treePanelNode) {
        if(treePanelNode && treePanelNode.title && treePanelNode.children){
            this.children.push(treePanelNode);
        }

        return this;
    }
};
