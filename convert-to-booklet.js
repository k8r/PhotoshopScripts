/* This script converts a series of .jpgs into another series of .jpgs that can 
be printed as a booklet. Each original .jpg is a spread in a book. The script
recombines the image halves to allow you to print the resulting .jpgs double-
sided, and fold into a booklet.*/

var title = "Convert to Printable Booklet";
var dirLabel = "Directory";

const persistentSettingsID = stringIDToTypeID("persistentSettings");
const previousFolderID = stringIDToTypeID("previousFolderKey");

function main() {
    
    var selectedFolder = selectFolder();
    var spreads = getCoverAndSpreads(selectedFolder);
    if (spreads == null)
        return;
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