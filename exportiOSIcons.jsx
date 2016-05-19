#include "./utilities.jsx"

// Saves the entire .psd as a series of .pngs in all the sizes needed for iOS iPad and iPhone icons

var chooseValidFolder = "Please choose a valid folder to export to.";
var correctSizeAlert = "Please ensure your image is square - ie width == height"
var openDocAlert = "You must have the document you wish to export open.";
var title = "Export iOS Launch Screens";
var exportLabel = "Export";
var cancel = "Cancel";
var destinationLabel = "Destination";
var browse = "Browse";
var notes = "Notes";
var whatWillBeExported = "1) All icons for iPhones and iPads will be exported.";
var titleSelectDestination = "Select Destination";
var appDescriptorName = "exportiOSIcons";

function exportLaunchScreens(destination) {
    var originalDoc = app.activeDocument;
    app.activeDocument.duplicate();
    
    // for iPhone
    resizeActiveDocument(180);
    saveFile("iPhoneApp_180x180.png", destination);
    
    resizeActiveDocument(120);
    saveFile("iPhoneApp_120x120.png", destination);
    saveFile("iPhoneSpotlight_120x120.png", destination);
    
    resizeActiveDocument(114);
    saveFile("iPhoneApp_114x114.png", destination);
    
    resizeActiveDocument(87);
    saveFile("iPhoneSpotlight_87x87.png", destination);
    
    resizeActiveDocument(80);
    saveFile("iPhoneSpotlight_80x80.png", destination);
    
    resizeActiveDocument(57);
    saveFile("iPhoneApp_57x57.png", destination);
    
    resizeActiveDocument(58);
    saveFile("iPhoneSpotlight_58x58.png", destination);
    
    resizeActiveDocument(29);
    saveFile("iPhoneSpotlight_29x29.png", destination);
    
    // reset
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    app.activeDocument = originalDoc;
    app.activeDocument.duplicate();
    
    // for iPad
    resizeActiveDocument(152);
    saveFile("iPadApp_152x152.png", destination);
    
    resizeActiveDocument(144);
    saveFile("iPadApp_144x144.png", destination);
    
    resizeActiveDocument(100);
    saveFile("iPadSpotlight_100x100.png", destination);
    
    resizeActiveDocument(80);
    saveFile("iPadSpotlight_80x80.png", destination);
    
    resizeActiveDocument(76);
    saveFile("iPadApp_76x76.png", destination);
    
    resizeActiveDocument(72);
    saveFile("iPadApp_72x72.png", destination);
    
    resizeActiveDocument(58);
    saveFile("iPadSettings_58x58.png", destination);
    
    resizeActiveDocument(50);
    saveFile("iPadSpotlight_50x50.png", destination);
    
    resizeActiveDocument(40);
    saveFile("iPadSpotlight_40x40.png", destination);
    
    resizeActiveDocument(29);
    saveFile("iPadSettings_29x29.png", destination);
    
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
    if (app.activeDocument.width != app.activeDocument.height) {
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
    dialog.panelNotes.add("statictext", undefined, whatWillBeExported);

    var result = dialog.show();
}

main();