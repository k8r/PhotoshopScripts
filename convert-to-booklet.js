/* This script converts a series of .jpgs into another series of .jpgs that can 
be printed as a booklet. Each original .jpg is a spread in a book. The script
recombines the image halves to allow you to print the resulting .jpgs double-
sided, and fold into a booklet. The image spreads should be in alpha-numeric
order, with the exception of the cover, which should be named "cover".*/

var title = "Convert to Printable Booklet";

const persistentSettingsID = stringIDToTypeID("persistentSettings");
const previousFolderID = stringIDToTypeID("previousFolderKey");

function main() {
    
    var selectedFolder = selectFolder();
    var spreads = getCoverAndSpreads(selectedFolder);
    if (spreads == null)
        return;
        
    var newFolder = makeFolderThatStartsWith("booklet", selectedFolder);
    
    // Recombine and save the interior pages
    if (spreads.length <= 1) {
        alert("You don't have enough images / spreads to make a booklet.");
    }
    
    // Save the cover and inside cover - sheet1-side1 and sheet1-side2
    var currDoc = open(spreads[0]);
    saveJpgAs(newFolder.fsName + "/sheet1-side1.jpg");
    currDoc.close(SaveOptions.DONOTSAVECHANGES);
    
    combineDocuments(open(spreads[1]), open(spreads[spreads.length - 1]), "sheet1-side2", newFolder);
    
    if (spreads.length <= 2)
        return;
    var upperIndex = spreads.length - 2;
    for (i = 2; i < spreads.length / 2 + 1; i++) {
        var side1Left = open(spreads[upperIndex + 1]);
        var side1Right = open(spreads[i - 1]);
        combineDocuments(side1Left, side1Right, "sheet" + i + "-side1", newFolder);
        
        var side2Left = open(spreads[i]);
        var side2Right = open(spreads[upperIndex]);
        combineDocuments(side2Left, side2Right, "sheet" + i + "-side2", newFolder);
        upperIndex--;
    }
}

function combineDocuments(forLeftSide, forRightSide, newName, newFolder) {
    app.preferences.rulerUnits = Units.PIXELS;
    
    app.activeDocument = forRightSide;
    var newDoc = app.documents.add(forRightSide.width, forRightSide.height, app.resolution, newName, NewDocumentMode.RGB);
    
    app.activeDocument = forRightSide;
    var midWidth = forRightSide.width / 2;
    forRightSide.selection.select([ [midWidth, 0], [forRightSide.width, 0], 
        [forRightSide.width, forRightSide.height], [midWidth, forRightSide.height] ]);
    forRightSide.selection.copy();
    app.activeDocument = newDoc;
    var newLayer = newDoc.paste();
    moveLayerTo(newLayer, midWidth, 0);
    
    app.activeDocument = forLeftSide;
    midWidth = forLeftSide.width / 2;
    forLeftSide.selection.select([ [0, 0], [midWidth, 0], 
        [midWidth, forLeftSide.height], [0, forLeftSide.height] ]);
    forLeftSide.selection.copy();
    app.activeDocument = newDoc;
    newLayer = newDoc.paste();
    moveLayerTo(newLayer, 0, 0);
    
    saveJpgAs(newFolder.fsName + "/" + newName + ".jpg");
    newDoc.close(SaveOptions.DONOTSAVECHANGES);
    if (forLeftSide == forRightSide) { 
        app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
        return;
    }
    forLeftSide.close(SaveOptions.DONOTSAVECHANGES);
    forRightSide.close(SaveOptions.DONOTSAVECHANGES);
}

function moveLayerTo(layer, x, y) {

  var position = layer.bounds;
  position[0] = x - position[0].as('px');
  position[1] = y - position[1].as('px');

  layer.translate(position[0],-position[1]);
}

function saveJpgAs(newFileName) {
    var jpgFile = new File(newFileName);
    var saveOptions = new JPEGSaveOptions();
    saveOptions.embedColorProfile = true;
    saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
    saveOptions.quality = 10;
    app.activeDocument.saveAs(jpgFile, saveOptions, true, Extension.LOWERCASE);
}

/* creates a folder named the given name, unless that folder exists, in which case
    it tacks on a number to make the folder unique */
function makeFolderThatStartsWith(name, parentFolder) {
    var newFolderName = parentFolder.fsName + "/" + name;
    var newFolder = new Folder(newFolderName);
    var subText = 1;
    while (newFolder.exists) {
        newFolder = new Folder(newFolderName + subText);
        subText++;
    }
    newFolder.create();
    return newFolder;
}

/* returns an array of files; the first file is the cover and the rest are the interior spreads */
function getCoverAndSpreads(selectedFolder) {
    var files = selectedFolder.getFiles();
    var cover = null;
    var spreads = [];
    var indexInSpreads = 1;
    for (var i = 0; i < files.length; i++) {
        var fileName = files[i].name.toLowerCase();
        if (fileName.length > 4 && fileName.slice(0,5) == "cover" && fileName.indexOf(".jpg") > 0) {
            cover = files[i];
            continue;
        }
        if (fileName.indexOf(".jpg") > 0) {
            spreads[indexInSpreads] = files[i];
            indexInSpreads++;
        }
    }
    if (cover == null) {
        alert("You need a cover image to run this script; it should be named 'cover'");
        return null;
    }
    spreads[0] = cover;
    return spreads;
}

function selectFolder() {
    dialog = new Window("dialog", title);
    titleSelectDirectory = "Select the source directory"

    var previouslySelectedFolder = getPreviouslySelectedFolder(); 
    var selectedFolder = Folder.selectDialog(titleSelectDirectory, previouslySelectedFolder);
    if (selectedFolder == null) {
        alert("You need to select a folder of image spreads to run this script");
        return;
    }
    saveSelectedFolder(selectedFolder.fsName);
    return selectedFolder;
}

function getPreviouslySelectedFolder() {
    var selectedFolder = "~";
    var settings;
    try {
        settings = getCustomOptions(persistentSettingsID);
    } catch (e) {
        settings = new ActionDescriptor();
    }
    
    if (settings.hasKey(previousFolderID))
        selectedFolder = settings.getString(previousFolderID);
    return selectedFolder;
}

function saveSelectedFolder(selectedFolder) {
    var selectedFolderDescriptor = new ActionDescriptor();
    selectedFolderDescriptor.putString(previousFolderID, selectedFolder);
    putCustomOptions(persistentSettingsID, selectedFolderDescriptor, true);
}

main();