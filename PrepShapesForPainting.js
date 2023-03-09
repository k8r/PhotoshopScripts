// @include "./utilities.jsx"

// Exports groups, each as a separate PNG

var chooseValidFolder = "Please choose a valid folder to export to.";
var openDocAlert = "You must have the document you wish to export open.";
var title = "Export groups as PNGs";
var scaleLabel = "Scale";
var exportLabel = "Export";
var cancel = "Cancel";
var destinationLabel = "Destination";
var browse = "Browse";
var notes = "Notes";
var scaleNote = "1) Images will be exported at the scale you choose, and at all smaller scales.";
var ignoreGroupNote = "2) If you don't want a group to be exported, include 'DONOTEXPORT' in its name.";
var emptySpaceNote = "3) The script will crop empty space around a group.";
var consistentSizeNote = "4) Alternatively, if you want to specify a size for a group, include a shape layer labeled 'SIZE'.";
var ipadSpecific = "5) If you add '~ipad' to the working art file name, that will be added to the resulting file names (to let you export tablet-specific graphics)";
var titleSelectDestination = "Select Destination";
var visibleOnly = "Export only visible groups";
var appDescriptor = "exportGroupsAtDifferentSizes";

var artLayerLabelForSize = "SIZE";
var layerSetLabelForDoNotExport = "DONOTEXPORT";
var specificScaleForLayerSetSeparator = "@";

// consts
var MAX_SCALE = 3;

// dups active document, resizes it to the given width, and makes the dupped doc the active doc
function dupActiveLayer(sourceArtScale, targetScale, layerSetName) {
    
    // from scripting listener - dups active layer into a new document
    var idMk = charIDToTypeID( "Mk  " );
    var desc39 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    var ref13 = new ActionReference();
    var idDcmn = charIDToTypeID( "Dcmn" );
    ref13.putClass( idDcmn );
    desc39.putReference( idnull, ref13 );
    var idUsng = charIDToTypeID( "Usng" );
    var ref14 = new ActionReference();
    var idLyr = charIDToTypeID( "Lyr " );
    var idOrdn = charIDToTypeID( "Ordn" );
    var idTrgt = charIDToTypeID( "Trgt" );
    ref14.putEnumerated( idLyr, idOrdn, idTrgt );
    desc39.putReference( idUsng, ref14 );
    var idVrsn = charIDToTypeID( "Vrsn" );
    desc39.putInteger( idVrsn, 5 );
    executeAction( idMk, desc39, DialogModes.NO );
    
    trimExtraSpace(app.activeDocument.activeLayer);
    
    //TODO - need to crop here
    var oneXWidth = app.activeDocument.width / sourceArtScale;
    var oneXHeight = app.activeDocument.width / sourceArtScale;
    var newWidth = oneXWidth * currScale; // make each one 1x and then multipy by current scale factor
    
    if (targetScale == sourceArtScale) { // only want one alert per layer
        if (oneXWidth.toString().indexOf(".") != -1 || oneXHeight.toString().indexOf(".") != -1) {
            alert("Consider resizing or repositioning '" + layerSetName + "'. Its size (in both dimensions) should be divisible by " + sourceArtScale + 
            ", and its x and y positions should be whole numbers.");
        }
    }
    resizeActiveDocument(newWidth);
}

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
    
    saveFile(fileName, destination);
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
    var sourceArtScale = exportOptions.scale + 1; // export options' scale refers to the drop down index, which is off by one
    for (currScale = sourceArtScale; currScale > 0; currScale--) {
        
        for( var i = 0; i < app.activeDocument.layerSets.length; i++) {
            
            // First check if we should skip exporting the current layer set
            if (exportOptions.visibleOnly) { 
                if (!originalDoc.layerSets[i].visible) {
                    continue;
                }
            }
            if (app.activeDocument.layerSets[i].name.indexOf(layerSetLabelForDoNotExport) != -1)
                continue;
        
            app.activeDocument.activeLayer = app.activeDocument.layerSets[i];
            dupActiveLayer(sourceArtScale, currScale, app.activeDocument.activeLayer.name); 
              
            exportLayerSet(app.activeDocument.activeLayer, currScale, exportOptions.destination, sourceArtScale, suffix);
            
            app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            app.activeDocument = originalDoc;
        }
    }       
}

// tries to get export info from photoshop registry first; if not there, initializes defaults
function getExportOptions() {
    try {
        var d = app.getCustomOptions(appDescriptor);
        var exportOptions = getOptionsFromDescriptor(d);
    }
    catch(e) {
        var exportOptions = [];
        exportOptions.destination = new String("");
        exportOptions.visibleOnly = false;
        exportOptions.scale = 1;
    }
    return exportOptions;
}

function main() {   
    if (typeof(app) === "undefined" || typeof(app.documents) === "undefined" || app.documents.length <= 0) {
        alert(openDocAlert);
        return 'cancel'; 
    }
    var shapesLayerSet = getLayerSetNamed("shapes");
    for (var i = 0; i < shapesLayerSet.layers.length; i++) {
        var currLayer = shapesLayerSet.layers[i];

        // move current layer to a new group/layer set
        var newLayerSet = shapesLayerSet.layerSets.add();
        newLayerSet.name = currLayer.name;
        currLayer.move(newLayerSet, ElementPlacement.INSIDE);

        // create two new layers to go into the new group/layer set
        var shadingLayer = app.activeDocument.artLayers.add();
        shadingLayer.move(newLayerSet, ElementPlacement.INSIDE);
        shadingLayer.name = "shading";
        shadingLayer.blendMode = BlendMode.MULTIPLY;

        var highlightsLayer = app.activeDocument.artLayers.add();
        highlightsLayer.name = "highlights";
        highlightsLayer.move(newLayerSet, ElementPlacement.INSIDE);

        shadingLayer.grouped = true;
        highlightsLayer.grouped = true;
        

        // collapse all layer sets / groups
        var idcollapseAllGroupsEvent = stringIDToTypeID("collapseAllGroupsEvent");
        var desc = new ActionDescriptor();
        executeAction(idcollapseAllGroupsEvent, desc, DialogModes.NO);
    }

    // add drop down to request source art size
    // dialog.panelScale = dialog.add("panel", undefined, scaleLabel);
    // dialog.panelScale.alignment = 'fill';
    // dialog.panelScale.alignChildren = 'left';
    // dialog.panelScale.orientation = 'row';
    // dialog.scale = dialog.panelScale.add("dropdownlist");
    // dialog.scale.preferredSize.height = 30;
    // dialog.scale.preferredSize.width = 60;

    // dialog.scale.add("item", "1x");
    // dialog.scale.add("item", "2x");
    // dialog.scale.add("item", "3x");
    // for (i = 0; i < dialog.scale.items.length; i++) {
    //     if (dialog.scale.items[i].toString().indexOf(exportOptions.scale) != -1) {
    //         dialog.scale.selection = i;
    //     }
    // }
    
    // dialog.onlyVisibleCheckbox = dialog.panelScale.add("checkbox", undefined, visibleOnly);
    // dialog.onlyVisibleCheckbox.value = exportOptions.visibleOnly;

    // // add destination panel
    // dialog.panelDest = dialog.add("panel", undefined, destinationLabel);
    // dialog.panelDest.alignment = 'fill';
    // dialog.panelDest.orientation = 'row';
    // dialog.panelDest.alignChildren = 'left';

    // dialog.destination = dialog.panelDest.add("edittext", undefined, exportOptions.destination);
    // dialog.destination.preferredSize.width = 500;

    // dialog.buttonBrowse = dialog.panelDest.add("button", undefined, browse);
    // dialog.buttonBrowse.onClick = function() {
    //     var defaultFolder = dialog.destination.text;
        
    //     var testFolder = new Folder(dialog.destination.text);
        
    //     if (!testFolder.exists) {
    //         defaultFolder = "~";
    //     }
    
    //     var selFolder = Folder.selectDialog(titleSelectDestination, defaultFolder);
    //     if ( selFolder != null ) {
    //         dialog.destination.text = selFolder.fsName;
    //     }
    // }

    // // add cancel and ok buttons
    // dialog.groupBottom = dialog.add("group");
    // dialog.exportButton = dialog.groupBottom.add("button", undefined, exportLabel);
    // dialog.cancelButton = dialog.groupBottom.add("button", undefined, cancel);
    // dialog.cancelButton.onClick = function() { 
    //     dialog.close(); 
    // }
    // dialog.exportButton.onClick = function() {
        
    //     if (dialog.destination.text.length <= 0) {
    //         alert(chooseValidFolder);                
    //         return;
    //     }
        
    //     exportOptions.scale = dialog.scale.selection;
    //     exportOptions.visibleOnly = dialog.onlyVisibleCheckbox.value;
    //     exportOptions.destination = dialog.destination.text;
        
    //     app.putCustomOptions(appDescriptor, getDescriptorFromOptions(exportOptions), true);
            
    //     exportLayerSets(exportOptions);
    //     dialog.close();
    // }

    // dialog.panelNotes = dialog.add("panel", undefined, notes);
    // dialog.panelNotes.alignment = 'fill';
    // dialog.panelNotes.orientation = 'column';
    // dialog.panelNotes.alignChildren = 'left';
    // dialog.panelNotes.add("statictext", undefined, scaleNote);
    // dialog.panelNotes.add("statictext", undefined, ignoreGroupNote);
    // dialog.panelNotes.add("statictext", undefined, emptySpaceNote);
    // dialog.panelNotes.add("statictext", undefined, consistentSizeNote);
    // dialog.panelNotes.add("statictext", undefined, ipadSpecific);

    // var result = dialog.show();
}

main();