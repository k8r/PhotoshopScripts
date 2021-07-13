/* This script resizes and saves low res and hi res copies of an image. 
It names the copies based on the indicated column and row. This script
is for updating images on my portfolio - katemariephillips.com - faster.
*/

#include "./utilities.jsx"

var outputDirectory = "/Users/kate/src/katesportfolio/HTML/assets/images/portfolio2";

const sizesForThumbnail = [600, 200]; 
const fileNameEndsForThumbnail = ["HiRes", "LowRes"];

const sizesForBigPicture = [1500, 500]; 
const fileNameEndsForBigPicture = ["HiRes", "LowRes"];

const sizesForBigImage = [];

function main() {

	var win = new Window('dialog','Settings for export');
	win.orientation='column';
	win.alignChildren = 'center';
	win.pnl1 = win.add('panel',undefined,'Row and Column', {borderStyle: 'black'} );
	win.pnl1.alignChildren = 'center';
	win.pnl1.input1 = win.pnl1.add('edittext',undefined,'1');
	win.pnl1.input2 = win.pnl1.add('edittext',undefined,'1');
	

	win.pnl2 = win.add('panel',undefined,'', {borderStyle: 'black'} );
	win.pnl2.alignChildren = 'center';
	win.pnl2.cb1 = win.pnl2.add('checkbox',undefined,'Thumbnail');
	win.pnl2.cb1.value = true;
	win.pnl2.cb2 = win.pnl2.add('checkbox',undefined,'Big Picture');
	win.pnl2.cb2.value = true;

	win.grp1 = win.add('group');
	win.select = win.grp1.add('button',undefined,'Ok');
	win.can = win.grp1.add('button',undefined,'Cancel');

	win.select.preferredSize = win.can.preferredSize=[70,20];

	win.select.onClick=function() {
		var row = win.pnl1.input1.text;
		var column = win.pnl1.input2.text;
		var shouldExportThumbnail = win.pnl2.cb1;
		var shouldExportBigPicture = win.pnl2.cb2;
		win.close(0);

		var savedState = app.activeDocument.activeHistoryState;

		if (shouldExportBigPicture) {
			for (var i = 0; i < sizesForBigPicture.length; i++) {
			 	app.activeDocument.resizeImage(sizesForBigPicture[i]);
			 	saveJpg(outputDirectory, "Row" + row + "Col" + column + "Big" + fileNameEndsForBigPicture[i]);
			 	app.activeDocument.activeHistoryState = savedState
			}
		}

		if (shouldExportThumbnail) {
			for (var i = 0; i < sizesForThumbnail.length; i++) {
			 	app.activeDocument.resizeImage(sizesForThumbnail[i]);
			 	saveJpg(outputDirectory, "Row" + row + "Col" + column + "Thumb" + fileNameEndsForThumbnail[i]);
			 	app.activeDocument.activeHistoryState = savedState
			}
		}
	}
	win.center();
	win.show();
	
}

main();