// Adjusts width, height, x, and y of all live shapes with a user-specified string in their names

var openDocAlert = "You must have a document open to use this script.";
var nameLable = "Partial Name of Live Shapes:";
var title = "Transform Live Shapes";

function main() {   
    if (typeof(app) === "undefined" || typeof(app.documents) === "undefined" || app.documents.length <= 0) {
        alert(openDocAlert);
        return 'cancel'; 
    }

    dialog = new Window("dialog", title);
     
     // add  text box for user-speicified live shape name
    dialog.panelName = dialog.add("panel", undefined, nameLable);
    dialog.panelName.alignment = 'fill';
    dialog.panelName.orientation = 'row';
    dialog.panelName.alignChildren = 'left';
    dialog.name = dialog.panelName.add("edittext", undefined, "");
    
    var result = dialog.show();
}

main();