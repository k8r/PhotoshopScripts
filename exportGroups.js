﻿
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
var titleSelectDestination = "Select Destination";
var visibleOnly = "Export only visible groups";
var appDescriptor = "exportGroupsAtDifferentSizes";

var artLayerLabelForSize = "SIZE";
var layerSetLabelForDoNotExport = "DONOTEXPORT";
var specificScaleForLayerSetSeparator = "@";

// consts
var MAX_SCALE = 3;

// Resize a picture WITH scaled styles
// app.activedocument.resizeImage() does NOT scale sizes
// so this code was generated by scripting listener plug-in
function resizeActiveDocument(newWidth) {
    var idImgS = charIDToTypeID("ImgS");
    var desc4 = new ActionDescriptor();
    var idWdth = charIDToTypeID("Wdth");
    var idPxl = charIDToTypeID("#Pxl");
    desc4.putUnitDouble(idWdth, idPxl, newWidth);
    var idscaleStyles = stringIDToTypeID("scaleStyles" );
    desc4.putBoolean(idscaleStyles, true);
    var idCnsP = charIDToTypeID( "CnsP" );
    desc4.putBoolean( idCnsP, true );
    var idIntr = charIDToTypeID( "Intr" );
    var idIntp = charIDToTypeID( "Intp" );
    var idautomaticInterpolation = stringIDToTypeID( "automaticInterpolation" );
    desc4.putEnumerated( idIntr, idIntp, idautomaticInterpolation );
    executeAction( idImgS, desc4, DialogModes.NO );
}

// dups active document, resizes it to the given width, and makes the dupped doc the active doc
function dupActiveLayer(newWidth) {
    
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

    resizeActiveDocument(newWidth);
}

// actually saves the file as a png with the given name and destination
function saveFile(fileName, scale, destination) {
    try {
        // code generated by scripting listener plug-in
        var idsave = charIDToTypeID("save");
        var desc7 = new ActionDescriptor();
        var idAs = charIDToTypeID("As  ");
        var desc8 = new ActionDescriptor();
        var idPGIT = charIDToTypeID("PGIT");
        var idPGIT = charIDToTypeID("PGIT");
        var idPGIN = charIDToTypeID("PGIN");
        desc8.putEnumerated(idPGIT, idPGIT, idPGIN);
        var idPNGf = charIDToTypeID("PNGf");
        var idPNGf = charIDToTypeID("PNGf");
        var idPGAd = charIDToTypeID("PGAd");
        desc8.putEnumerated(idPNGf, idPNGf, idPGAd);
        var idCmpr = charIDToTypeID("Cmpr");
        desc8.putInteger(idCmpr, 0);
        var idPNGF = charIDToTypeID("PNGF");
        desc7.putObject(idAs, idPNGF, desc8);
        var idIn = charIDToTypeID("In  ");
        desc7.putPath(idIn, new File(destination + "/" + fileName));
        var idDocI = charIDToTypeID("DocI");
        desc7.putInteger(idDocI, 1487);
        var idCpy = charIDToTypeID("Cpy ");
        desc7.putBoolean(idCpy, true);
        var idLwCs = charIDToTypeID("LwCs");
        desc7.putBoolean(idLwCs, true);
        var idsaveStage = stringIDToTypeID("saveStage");
        var idsaveStageType = stringIDToTypeID("saveStageType");
        var idsaveSucceeded = stringIDToTypeID("saveSucceeded");
        desc7.putEnumerated(idsaveStage, idsaveStageType, idsaveSucceeded);
        executeAction(idsave, desc7, DialogModes.NO);
    }
    catch (error) {
        alert("Unable to export " + fileName + " for scale " + scale + ": " + error.msg);
    }

}

function hideLayerSets() {
    var doc = app.activeDocument;
    for (var i = 0 ; i < doc.layerSets.length; i++){
        doc.layerSets[i].visible = false;
    }
}

// export the given layer set; assumes that all layerSets and artLayers are invisible;
// also assumes that the document that the layerSet belongs to is the active document
function exportLayerSet(layerSet, currScale, destination, sourceArtScale) {
    hideLayerSets();
    
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

    // if we are exporting at the source art scale, check that x and y dimensions will resullt in whole numbers for all smaller scales
    // check is here, instead of where we resize document because we need trimming to have already occurred (only care about layer set sizes, not document size)
    if (currScale == sourceArtScale) {
        for (testScale= sourceArtScale - 1; testScale > 0; testScale--) {
            var layerSetWidth = app.activeDocument.width.value / sourceArtScale * testScale;
            var layerSetHeight = app.activeDocument.height.value / sourceArtScale * testScale;
            
            if (layerSetWidth.toString().indexOf(".") != -1 || layerSetHeight.toString().indexOf(".") != -1) {
                alert("Consider resizing '" + layerSet.name + "'. Multiplying by " + testScale + "/" + sourceArtScale + " for the " + testScale + "x version results in " + layerSetWidth
                + "x" + layerSetHeight);
            }
        }
    }
    

    var fileName = layerSet.name.replace(/[:\/\\*\?\"\<\>\|]/g, "_");  // replace special chars with an underscore
    if (fileName.length > 120) {
        fileName = fileName.substring(0, 120);
    }
    var fileNameParts = fileName.split(specificScaleForLayerSetSeparator);
    if (currScale > 1) {
        fileName = fileNameParts[0] + specificScaleForLayerSetSeparator + currScale + "x";
    }
    else {
        fileName = fileNameParts[0];
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

    if (app.activeDocument.layerSets.length <= 0) {
        return;
    }
    var originalDoc = app.activeDocument;
    var sourceArtScale = exportOptions.scale + 1; // export options' scale refers to the drop down index, which is off by one
    for (currScale = sourceArtScale; currScale > 0; currScale--) {
        
        var newWidth = app.activeDocument.width / sourceArtScale * currScale; // make each one 1x and then multipy by current scale factor
        
        for( var i = 0; i < app.activeDocument.layerSets.length; i++) {
            
            // First check if we should skip exporting the current layer set
            if (exportOptions.visibleOnly) { 
                if (!originalDoc.layerSets[i].visible) {
                    continue;
                }
            }
            if (app.activeDocument.layerSets[i].name.indexOf(layerSetLabelForDoNotExport) != -1)
                continue;
                
            // TODO - need to come up with a tactic for this that doesn't require looping through all layers!!
            // check if there exists a layer set with the current name specifically for the current scale, and make sure it is the current layer set
            //var layerSetForScale = findLayerSetForScale(currScale, app.activeDocument.layerSets[i].name);
           // if ((layerSetForScale != null || app.activeDocument.layerSets[i].name.indexOf(specificScaleForLayerSetSeparator) != -1) 
                //&& layerSetForScale != app.activeDocument.layerSets[i].name) { 
               // continue;
            //}
        
            app.activeDocument.activeLayer = app.activeDocument.layerSets[i];
            dupActiveLayer(newWidth); 
              
            exportLayerSet(app.activeDocument.activeLayer, currScale, exportOptions.destination, sourceArtScale);
            
            app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            app.activeDocument = originalDoc;
        }
    }       
}

// tries to get export info from photoshop registry first; if not there, initializes defaults
function getExportOptions() {
    try {
        var d = app.getCustomOptions(appDescriptor);
        exportOptions = getExportOptionsFromDescriptor(d);
    }
    catch(e) {
        exportOptions.destination = new String("");
        exportOptions.visibleOnly = false;
        exportOptions.scale = 1;
    }
    return exportOptions;
}

function getExportOptionsFromDescriptor(desc) {
    var exportOptions = new Object();
    for (var i = 0; i < desc.count; i++ ) {
        var descKey = desc.getKey(i); 
        var type = desc.getType(descKey);
        var key = app.typeIDToStringID(descKey);
        
        switch (type) {
            case DescValueType.BOOLEANTYPE:
                exportOptions[key] = desc.getBoolean(descKey);
                break;
            case DescValueType.STRINGTYPE:
                exportOptions[key] = desc.getString(descKey);
                break;
            case DescValueType.DOUBLETYPE:
                exportOptions[key] = desc.getDouble(descKey);
                break;
        }
    }
    return exportOptions;
}

function getDescriptorFromExportOptions(exportOptions) {
    var desc = new ActionDescriptor();  
    for (key in exportOptions) {
        keyID = app.stringIDToTypeID(key);
        
        if ((typeof(exportOptions[key])).indexOf("number") != -1) {
            desc.putDouble(keyID, exportOptions[key]);
        }
        else if ((typeof(exportOptions[key])).indexOf("boolean") != -1) {
            desc.putBoolean(keyID, exportOptions[key]);
        }
        else {
            desc.putString(keyID, exportOptions[key].toString());
        }
    }
    
    return desc;
}

function main() {   
    if (typeof(app) === "undefined" || typeof(app.documents) === "undefined" || app.documents.length <= 0) {
        alert(openDocAlert);
        return 'cancel'; 
    }

    var exportOptions = getExportOptions();

    dialog = new Window("dialog", title);

    // add drop down to request source art size
    dialog.panelScale = dialog.add("panel", undefined, scaleLabel);
    dialog.panelScale.alignment = 'fill';
    dialog.panelScale.alignChildren = 'left';
    dialog.panelScale.orientation = 'row';
    dialog.scale = dialog.panelScale.add("dropdownlist");
    dialog.scale.preferredSize.height = 30;
    dialog.scale.preferredSize.width = 60;

    dialog.scale.add("item", "1x");
    dialog.scale.add("item", "2x");
    dialog.scale.add("item", "3x");
    for (i = 0; i < dialog.scale.items.length; i++) {
        if (dialog.scale.items[i].toString().indexOf(exportOptions.scale) != -1) {
            dialog.scale.selection = i;
        }
    }
    
    dialog.onlyVisibleCheckbox = dialog.panelScale.add("checkbox", undefined, visibleOnly);
    dialog.onlyVisibleCheckbox.value = exportOptions.visibleOnly;

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
        
        exportOptions.scale = dialog.scale.selection;
        exportOptions.visibleOnly = dialog.onlyVisibleCheckbox.value;
        exportOptions.destination = dialog.destination.text;
        
        app.putCustomOptions(appDescriptor, getDescriptorFromExportOptions(exportOptions), true);
            
        exportLayerSets(exportOptions);
        dialog.close();
    }

    dialog.panelNotes = dialog.add("panel", undefined, notes);
    dialog.panelNotes.alignment = 'fill';
    dialog.panelNotes.orientation = 'column';
    dialog.panelNotes.alignChildren = 'left';
    dialog.panelNotes.add("statictext", undefined, scaleNote);
    dialog.panelNotes.add("statictext", undefined, ignoreGroupNote);
    dialog.panelNotes.add("statictext", undefined, emptySpaceNote);
    dialog.panelNotes.add("statictext", undefined, consistentSizeNote);

    var result = dialog.show();
}

main();