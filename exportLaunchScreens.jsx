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

var artLayerLabelForSize = "SIZE";
var layerSetLabelForDoNotExport = "DONOTEXPORT";
var specificScaleForLayerSetSeparator = "@";

// consts
var MAX_SCALE = 3;

function trimExtraSpace(layerSet) {
    // get bounds of layer, if size layer exists
    // make size layer invisible if it exists
    // make other art layers visible
    var bounds = [];
    layerSet.visible = true;
    for ( var j = 0; j < layerSet.artLayers.length; j++) {
        layerSet.artLayers[j].visible = true;
        if (layerSet.artLayers[j].name.indexOf(artLayerLabelForSize) != -1) {
            bounds = layerSet.artLayers[j].bounds;
            layerSet.artLayers[j].visible = false;
        }
    }
    
    // crop doc to bounds from size art layer, or trim transparency if no size art layer
    if (bounds.length > 0) {
        app.activeDocument.crop(bounds);
      }
    else {
        app.activeDocument.trim(TrimType.TRANSPARENT);
    } 
}

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

    // iPad Non-retina Portrait
    resizeActiveDocument(768);
    saveFile("Default-Portrait.png", destination);
    
    // iPad Non-retina Landscape
    changeCanvasSize(2048, 1536, upperLeftColor);
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

// export the given layer set; assumes that all layerSets and artLayers are invisible;
// also assumes that the document that the layerSet belongs to is the active document
function exportLayerSet(layerSet, currScale, destination, sourceArtScale, suffix) {

    var fileName = layerSet.name.replace(/[:\/\\*\?\"\<\>\|]/g, "_");  // replace special chars with an underscore
    if (fileName.length > 120) {
        fileName = fileName.substring(0, 120);
    }
    var fileNameParts = fileName.split(specificScaleForLayerSetSeparator);
    fileName = fileNameParts[0];
    if (currScale > 1) {
        fileName = fileName + specificScaleForLayerSetSeparator + currScale + "x";
    }
    if (suffix != null) {
        fileName += suffix;
    }
    
    saveFile(fileName, currScale, destination);
}

// finds the layer set (if there is one) that is targeted to the given scale, with the given name
// for instance, if you want to have your 1x image be different from 2x and 3x, you would name 
// it nameOfImage@1x (an image corresponds to a layer set) 
function findLayerSetForScale(scale, layerSetName) {
    for( var i = 0; i < app.activeDocument.layerSets.length; i++) {
        var parts = layerSetName.split(specificScaleForLayerSetSeparator);
        if (app.activeDocument.layerSets[i].name.indexOf(parts[0] + specificScaleForLayerSetSeparator + scale) != -1) {
            return app.activeDocument.layerSets[i].name;
        }
    }
    return null;
}

function exportLayerSets(exportOptions) {

    var suffix = null;
    if (app.activeDocument.name.indexOf("~ipad") != -1) {
        suffix = "~ipad";
    }

    if (app.activeDocument.layerSets.length <= 0) {
        return;
    }
    var originalDoc = app.activeDocument; 
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