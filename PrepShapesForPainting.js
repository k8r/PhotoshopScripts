﻿// @include "./utilities.jsx"

var BASE_RING_WIDTH = 3;
var PERCENT_TO_RESIZE_RING_WIDTH = 101;

function createShadingAndHighlightLayers(destinationSet) {
     // create two new layers to go into the new group/layer set
     var shadingLayer = app.activeDocument.artLayers.add();
     shadingLayer.move(destinationSet, ElementPlacement.INSIDE);
     shadingLayer.name = "shading";
     shadingLayer.blendMode = BlendMode.MULTIPLY;

     var highlightsLayer = app.activeDocument.artLayers.add();
     highlightsLayer.name = "highlights";
     highlightsLayer.move(destinationSet, ElementPlacement.INSIDE);

     shadingLayer.grouped = true;
     highlightsLayer.grouped = true;
}

function selectPixelsOnActiveLayer() {
    sTT = stringIDToTypeID;

    (ref1 = new ActionReference()).putProperty(c = sTT('channel'), sTT('selection'));
    (dsc = new ActionDescriptor()).putReference(sTT('null'), ref1);
    (ref2 = new ActionReference()).putEnumerated(c, c, sTT('transparencyEnum'))
    dsc.putReference(sTT('to'), ref2), executeAction(sTT('set'), dsc);
}

function createRingAroundSelection() {
    selectPixelsOnActiveLayer();
    app.activeDocument.selection.contract(BASE_RING_WIDTH);
    app.activeDocument.selection.clear();
    app.activeDocument.selection.deselect();
}

function createRingAndOffset(x, y, layer, layerSet) {
    var firstRingLayer = layer.duplicate(layerSet, ElementPlacement.PLACEATEND);
    app.activeDocument.activeLayer = firstRingLayer;
    createRingAroundSelection();
    app.activeDocument.activeLayer.resize(PERCENT_TO_RESIZE_RING_WIDTH, PERCENT_TO_RESIZE_RING_WIDTH, 
        AnchorPosition.MIDDLECENTER);
    app.activeDocument.activeLayer.translate(new UnitValue( x, 'px' ),y);
    return firstRingLayer;
}

function createRing(baseNumToRandomize, layer, layerSet, textureLayer, angleToRotate) {
    var x = Math.floor(Math.random() * (baseNumToRandomize * 3 - (-3 * baseNumToRandomize) + 1) + (-3 * baseNumToRandomize));
    var y = Math.floor(Math.random() * (baseNumToRandomize * 3 - (-3 * baseNumToRandomize) + 1) + (-3 * baseNumToRandomize));
    return createRingAndOffset(x, y, layer, layerSet);
}

function main() {   
    if (typeof(app) === "undefined" || typeof(app.documents) === "undefined" || app.documents.length <= 0) {
        alert(openDocAlert);
        return 'cancel'; 
    }

    // add texture layer to use later
    var fileRef = "/Users/kate/src/PhotoshopScripts/Texture.jpg";
    app.open(new File( fileRef ));
    var mainDoc = app.documents[0];
    var textureDoc = app.documents[1];
    activeDocument = textureDoc;
    var curLayer = textureDoc.activeLayer;

    curLayer.duplicate (mainDoc, ElementPlacement.PLACEATEND);
    activeDocument = mainDoc;

    // create new shapes layer to copy existing shapes to and manipulate
    var newShapesLayerSet = app.activeDocument.layerSets.add();
    newShapesLayerSet.name = "preppedShapes";

    var shapesLayerSet = getLayerSetNamed("shapes");
    // iterate through backwards to keep the same order in the destination layer set; layer sets are always added on top
    for (var i = shapesLayerSet.layers.length - 1; i > -1; i--) { 
        var currLayer = shapesLayerSet.layers[i];

        // move current layer to a new group/layer set
        var newLayerSet = newShapesLayerSet.layerSets.add(ElementPlacement.INSIDE);
        newLayerSet.name = currLayer.name;
        currLayer = currLayer.duplicate(newLayerSet, ElementPlacement.INSIDE);

        // contract the layer so adding the rings doesn't make it too big
        app.activeDocument.activeLayer = currLayer;
        selectPixelsOnActiveLayer();
        app.activeDocument.selection.contract(BASE_RING_WIDTH*2);
        app.activeDocument.selection.invert();
        app.activeDocument.selection.clear();
        app.activeDocument.selection.deselect();

        // create and semi randomize the rings
        for (var j = 0; j < 8; j++) {
            var ring = createRing(BASE_RING_WIDTH, currLayer, newLayerSet, undefined, 20);
            if (j > 4) {
                ring.opacity = 50;
            }
        }

        createShadingAndHighlightLayers(newLayerSet);

        // collapse all layer sets / groups
        var idcollapseAllGroupsEvent = stringIDToTypeID("collapseAllGroupsEvent");
        var desc = new ActionDescriptor();
        executeAction(idcollapseAllGroupsEvent, desc, DialogModes.NO);

    }

    // move the shapes to a new layer set to reorder them
    // var newShapesLayerSet = app.activeDocument.layerSets.add();
    // newShapesLayerSet.name = "preppedShapes";
    // for (var i = 0; i < shapesLayerSet.layerSets.length; i++) {
    //     alert(shapesLayerSet.layerSets[i] + " " + newShapesLayerSet);
    //     //shapesLayerSet.layerSets[i].move(newShapesLayerSet);
    //     moveLayerSetIntoAnother(newShapesLayerSet, shapesLayerSet);
    // }

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