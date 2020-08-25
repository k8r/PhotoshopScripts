/* This script converts a series of .jpgs into another series of .jpgs that can 
be printed as a booklet. Each original .jpg is a spread in a book. The script
recombines the image halves to allow you to print the resulting .jpgs double-
sided, and fold into a booklet.*/

var title = "Convert to Printable Booklet";
var dirLabel = "Directory";

function main() {
    
    dialog = new Window("dialog", title);
    titleSelectDirectory = "Select the source directory"

    var defaultFolder = "~";
    var selectedFolder = Folder.selectDialog(titleSelectDirectory, defaultFolder);
    if ( selectedFolder != null ) {
        /* do work here */
    }
}

main();