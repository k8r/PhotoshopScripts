﻿// @include "./utilities.jsx"

var BASE_RING_WIDTH = 2.0;
var NUM_RINGS = 6;

var TEXTURE_FOR_RINGS_LAYER_NAME = "textureForRings";
var TEXTURE_FOR_MAIN_SHAPE_LAYER_NAME = "textureForMainShape";
var RANGE_FOR_DELETION_GUIDED_BY_TEXTURE_FOR_MAIN_SHAPE = "50.0";
var RANGE_FOR_DELETION_GUIDED_BY_TEXTURE_FOR_RINGS = "250.0";

var HOW_MUCH_BLUR_FOR_EDGES = 2;

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

function createRingAroundSelection() {
    selectPixelsOnActiveLayer();
    app.activeDocument.selection.contract(BASE_RING_WIDTH);
    app.activeDocument.selection.clear();
    app.activeDocument.selection.deselect();
}

function createExpandedRing(expandAmount, layer, layerSet) {
    var ringLayer = layer.duplicate(layerSet, ElementPlacement.PLACEATEND);
    app.activeDocument.activeLayer = ringLayer;
    createRingAroundSelection();

    var activeLayer = app.activeDocument.activeLayer;
    var resizePercentAmount = 100.0 + (expandAmount / (activeLayer.bounds[2] - activeLayer.bounds[0]) * 100.0);
    activeLayer.resize(resizePercentAmount, resizePercentAmount, AnchorPosition.MIDDLECENTER);

    return ringLayer;
}

function createOffsetRing(horizontalOffset, verticalOffset, layer, layerSet) {
    var ringLayer = layer.duplicate(layerSet, ElementPlacement.PLACEATEND);
    app.activeDocument.activeLayer = ringLayer;
    createRingAroundSelection();

    app.activeDocument.activeLayer.translate(new UnitValue( horizontalOffset, 'px' ), new UnitValue(verticalOffset, 'px'));
    return ringLayer;
}

function createRing(baseNumToRandomize, layer, layerSet) {
    var x = Math.floor(Math.random() * (baseNumToRandomize * 3 - (-3 * baseNumToRandomize) + 1) + (-3 * baseNumToRandomize));
    var y = Math.floor(Math.random() * (baseNumToRandomize * 3 - (-3 * baseNumToRandomize) + 1) + (-3 * baseNumToRandomize));
    return createExpandedRing(x, y, layer, layerSet);
}

// blurs the edges of the layer, adding in some texture too
function blurAndTexturizeActiveLayer(blurAmount, textureFeatherAmount, textureLayerName, textureRangeValue, shouldKeepSolidLayer) {
    var layer = app.activeDocument.activeLayer;
    newLayer = layer.duplicate();
    deleteGuidedByTexture(newLayer, textureLayerName, textureRangeValue, textureFeatherAmount);
    newLayer.applyGaussianBlur(blurAmount / 4.0);
    if (!shouldKeepSolidLayer) {
        layer.remove();
        app.activeDocument.activeLayer = newLayer;
        return newLayer;
    }

    contractActiveLayer(blurAmount * 3.0);
    layer.applyGaussianBlur(blurAmount);
    newLayer.merge(); // assumes newLayer was put on top of layer when duplicated

    return app.activeDocument.activeLayer;
}

function deleteGuidedByTexture(layer, textureLayerName, rangeValue, featherAmount) {
    var currActiveLayer = app.activeDocument.activeLayer;
    
    var textureLayer = getFirstLayerWithName(textureLayerName);
    var copyOfTextureLayer = textureLayer.duplicate(layer, ElementPlacement.PLACEBEFORE);
    app.activeDocument.activeLayer = copyOfTextureLayer;
    selectColorRange(RGBc(0.0, 0.0, 0.0), RGBc(rangeValue, rangeValue, rangeValue));
    app.activeDocument.selection.feather(featherAmount);
    app.activeDocument.activeLayer = layer;
    copyOfTextureLayer.remove();
    app.activeDocument.selection.clear();
    app.activeDocument.selection.deselect();
    

    app.activeDocument.activeLayer = currActiveLayer;
}

function addTextureLayer(pathToFile, nameOfLayer) {
    var fileRef = pathToFile;
    app.open(new File( fileRef ));
    var mainDoc = app.documents[0];
    var textureDoc = app.documents[1];
    activeDocument = textureDoc;
    var textureLayer = textureDoc.activeLayer;

    textureLayer.duplicate (mainDoc, ElementPlacement.PLACEATEND);
    textureDoc.close();
    activeDocument = mainDoc;
    mainDoc.layers[mainDoc.layers.length - 1].name = nameOfLayer;
}

function main() {   
    if (typeof(app) === "undefined" || typeof(app.documents) === "undefined" || app.documents.length <= 0) {
        alert(openDocAlert);
        return 'cancel'; 
    }

    // add texture layers to use later
    addTextureLayer("/Users/kate/src/PhotoshopScripts/Texture.jpg", TEXTURE_FOR_MAIN_SHAPE_LAYER_NAME);
    addTextureLayer("/Users/kate/src/PhotoshopScripts/RingTexture.jpg", TEXTURE_FOR_RINGS_LAYER_NAME);
    

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
        var tempLayer = currLayer.duplicate(newLayerSet, ElementPlacement.INSIDE);
        currLayer.visible = false;
        currLayer = tempLayer;

        // contract the layer so adding the rings doesn't make it too big
        app.activeDocument.activeLayer = currLayer;
        contractActiveLayer(BASE_RING_WIDTH / 4.0);

        // create and semi randomize the rings
        for (var j = 0; j < NUM_RINGS; j++) {
            
            var expandAmount = (j * BASE_RING_WIDTH * 3.0);
            var offsetAmount = expandAmount / 2.0;
            
            textureLayer = getFirstLayerWithName(TEXTURE_FOR_RINGS_LAYER_NAME);
            textureLayer.resize(-100, undefined);
            if (j%2== 0)
                textureLayer.resize(100, -100, undefined);

            var ring = createExpandedRing(expandAmount, currLayer, newLayerSet);
            ring = blurAndTexturizeActiveLayer(0, BASE_RING_WIDTH / 2.0, TEXTURE_FOR_RINGS_LAYER_NAME, 
                        RANGE_FOR_DELETION_GUIDED_BY_TEXTURE_FOR_RINGS, false);

            var offsetRing = undefined;            
            switch (j) {
                case 0:
                    offsetRing = createOffsetRing(BASE_RING_WIDTH * 2.0, BASE_RING_WIDTH * 2.0, currLayer, newLayerSet);
                    ring.opacity = 90;
                    offsetRing.opacity = 50;
                    break;
                case 1:
                    offsetRing = createOffsetRing(-1 * BASE_RING_WIDTH * 2.0, BASE_RING_WIDTH * 2.0, currLayer, newLayerSet);
                    ring.opacity = 80;
                    offsetRing.opacity = 50;
                    break;
                case 2:
                    offsetRing = createOffsetRing(BASE_RING_WIDTH * 2.0, -1 * BASE_RING_WIDTH * 2.0, currLayer, newLayerSet);
                    ring.opacity = 70;
                    offsetRing.opacity = 50;
                    break;
                case 3:
                    offsetRing = createOffsetRing(-1 * BASE_RING_WIDTH * 2.0, -1 * BASE_RING_WIDTH * 2.0, currLayer, newLayerSet);
                    ring.opacity = 60;
                    offsetRing.opacity = 50;
                    break;
                default:
                    ring.opacity = 50;
            }
            if (offsetRing != undefined) {
                app.activeDocument.activeLayer = offsetRing;
                blurAndTexturizeActiveLayer(0, BASE_RING_WIDTH / 2.0, TEXTURE_FOR_RINGS_LAYER_NAME, 
                        RANGE_FOR_DELETION_GUIDED_BY_TEXTURE_FOR_RINGS, false);
            }
            
        }

        // blur and texturize the edges of the main shape
        app.activeDocument.activeLayer = currLayer;
        blurAndTexturizeActiveLayer(HOW_MUCH_BLUR_FOR_EDGES, HOW_MUCH_BLUR_FOR_EDGES, TEXTURE_FOR_MAIN_SHAPE_LAYER_NAME, 
            RANGE_FOR_DELETION_GUIDED_BY_TEXTURE_FOR_MAIN_SHAPE, true);

        // merge all the rings down
        for (var j = 0; j < NUM_RINGS + 4; j++) { // the four is the number of offset ring layers made above
            app.activeDocument.activeLayer = currLayer;
            currLayer = app.activeDocument.activeLayer.merge();
        }

        createShadingAndHighlightLayers(newLayerSet);

        // collapse all layer sets / groups
        var idcollapseAllGroupsEvent = stringIDToTypeID("collapseAllGroupsEvent");
        var desc = new ActionDescriptor();
        executeAction(idcollapseAllGroupsEvent, desc, DialogModes.NO);

        shapesLayerSet.visible = false;

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