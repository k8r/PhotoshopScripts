#include "./utilities.jsx"

// Saves the entire .psd as a series of .pngs in all the sizes needed for the iOS launch screen
// it is expected that the source art (the .psd) is the retina ipad size (1536x2048)

var chooseValidFolder = "Please choose a valid folder to export to.";
var correctSizeAlert = "Please ensure your document is 1536x2048 - the iPad Retina Portrait Size"
var openDocAlert = "You must have the document you wish to export open.";
var title = "Export iOS Launch Screens";
var exportLabel = "Export";
var cancel = "Cancel";
var destinationLabel = "Destination";
var browse = "Browse";
var notes = "Notes";
var sourceArtSize = "1) Source art should be the iPad Retina size - 1536x2048.";
var processNote = "2) The resulting images will be cropped and resized to fit the aspect ratio and size required for each device.";
var avoidMistakesNote = "3) Put your art in the center, and double-check resulting images to make sure nothing important was trimmed.";
var addToResources = "4) Be sure to add the resulting images to your Resources directory, and add them in your IDE.";
var titleSelectDestination = "Select Destination";
var appDescriptorName = "exportLaunchScreens";

function exportLaunchScreens(destination) {
    var originalDoc = app.activeDocument;
    app.activeDocument.duplicate();
    
    var sampler = app.activeDocument.colorSamplers.add([0, 0]); // get color at 0, 0 for extra space in resulting image
    var upperLeftColor = sampler.color;
    
    // iPad Retina Portrait
    saveFile("Default-Portrait@2x.png", destination);
    
    // iPad Retina Landscape
    changeCanvasSize(2048, 1536, upperLeftColor);
    saveFile("Default-Landscape@2x.png", destination);
    
    // reset
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    app.activeDocument = originalDoc;
    app.activeDocument.duplicate();
    
    // iPhone 6 Plus
    resizeActiveDocument(1242);
    changeCanvasSize(1242, 2208, upperLeftColor);
    saveFile("Default-736h@3x.png", destination);
    
    // iPhone 6
    resizeActiveDocument(750);
    changeCanvasSize(750, 1334, upperLeftColor);
    saveFile("Default-667h@3x.png", destination);

    // iPad Non-retina Portrait
    resizeActiveDocument(768);
    saveFile("Default-Portrait.png", destination);
    
    // iPad Non-retina Landscape
    changeCanvasSize(1024, 768, upperLeftColor);
    saveFile("Default-Landscape.png", destination);
    
    // reset
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    app.activeDocument = originalDoc;
    app.activeDocument.duplicate();
    
    // iPhone Retina (4 inch)
    resizeActiveDocument(640);
    changeCanvasSize(640, 1136, upperLeftColor);
    saveFile("Default-568h@2x.png", destination);
    
    // iPhone Retina (3.5 inch)
    changeCanvasSize(640, 960, upperLeftColor);
    saveFile("Default@2x.png", destination);
    
    // iPhone Non-Retina 
    resizeActiveDocument(320);
    saveFile("Default.png", destination);
    
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    app.activeDocument = originalDoc;
    
}

// tries to get export info from photoshop registry first; if not there, initializes defaults
function getExportOptions() {
    try {
        var d = app.getCustomOptions(appDescriptorName);
        var exportOptions = getOptionsFromDescriptor(d);
    }
    catch(e) {
        var exportOptions = [];
        exportOptions.destination = new String("");
    }
    return exportOptions;
}

function main() {   

    if (typeof(app) === "undefined" || typeof(app.documents) === "undefined" || app.documents.length <= 0) {
        alert(openDocAlert);
        return 'cancel'; 
    }
    if (app.activeDocument.width != 1536 || app.activeDocument.height != 2048) {
        alert(correctSizeAlert);
        return 'cancel'; 
    }

    var exportOptions = getExportOptions();

    dialog = new Window("dialog", title);

    // add destination panel
    dialog.panelDest = dialog.add("panel", undefined, destinationLabel);
    dialog.panelDest.alignment = 'fill';
    dialog.panelDest.orientation = 'row';
    dialog.panelDest.alignChildren = 'left';

    dialog.destination = dialog.panelDest.add("edittext", undefined, exportOptions.destination);
    dialog.destination.preferredSize.width = 500;

    dialog.buttonBrowse = dialog.panelDest.add("button", undefined, browse);
    dialog.buttonBrowse.onClick = function() {
        var defaultFolder = dialog.destination.text;
        
        var testFolder = new Folder(dialog.destination.text);
        
        if (!testFolder.exists) {
            defaultFolder = "~";
        }
    
        var selFolder = Folder.selectDialog(titleSelectDestination, defaultFolder);
        if ( selFolder != null ) {
            dialog.destination.text = selFolder.fsName;
        }
    }

    // add cancel and ok buttons
    dialog.groupBottom = dialog.add("group");
    dialog.exportButton = dialog.groupBottom.add("button", undefined, exportLabel);
    dialog.cancelButton = dialog.groupBottom.add("button", undefined, cancel);
    dialog.cancelButton.onClick = function() { 
        dialog.close(); 
    }
    dialog.exportButton.onClick = function() {
        
        if (dialog.destination.text.length <= 0) {
            alert(chooseValidFolder);                
            return;
        }
        
        exportOptions.destination = dialog.destination.text;
        
        app.putCustomOptions(appDescriptorName, getDescriptorFromOptions(exportOptions), true);
            
        exportLaunchScreens(exportOptions.destination);
        dialog.close();
    }

    dialog.panelNotes = dialog.add("panel", undefined, notes);
    dialog.panelNotes.alignment = 'fill';
    dialog.panelNotes.orientation = 'column';
    dialog.panelNotes.alignChildren = 'left';
    dialog.panelNotes.add("statictext", undefined, sourceArtSize);
    dialog.panelNotes.add("statictext", undefined, processNote);
    dialog.panelNotes.add("statictext", undefined, avoidMistakesNote);
    dialog.panelNotes.add("statictext", undefined, addToResources);

    var result = dialog.show();
}

main();