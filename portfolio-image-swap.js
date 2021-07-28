/* This script swaps the names of a group of images that use the 
naming convention for katemariephillips.com */

#include "./utilities.jsx"

var outputDirectory = "/Users/kate/src/katesportfolio/HTML/assets/images/portfolio2";

function main() {

	var win = new Window('dialog','Settings for export');
	win.orientation='column';
	win.alignChildren = 'center';
	win.pnl1 = win.add('panel',undefined,'Swap images:', {borderStyle: 'black'} );
	win.pnl1.alignChildren = 'center';
	win.pnl1.input1 = win.pnl1.add('edittext',undefined,'1');
	win.pnl1.input2 = win.pnl1.add('edittext',undefined,'2');

	win.grp1 = win.add('group');
	win.select = win.grp1.add('button',undefined,'Ok');
	win.can = win.grp1.add('button',undefined,'Cancel');

	win.select.preferredSize = win.can.preferredSize=[70,20];

	win.select.onClick=function() {
		var firstSetOfFiles = getFileNamesThatContain(outputDirectory, "Num" + win.pnl1.input1.text + "(T|B)");
		var secondSetOfFiles = getFileNamesThatContain(outputDirectory, "Num" + win.pnl1.input2.text + "(T|B)");
		for (var i = 0; i < firstSetOfFiles.length; i++) {
			firstSetOfFiles[i].rename("temp" + firstSetOfFiles[i].name);
		}
		for (var i = 0; i < secondSetOfFiles.length; i++) {
			secondSetOfFiles[i].rename(secondSetOfFiles[i].name.replace(win.pnl1.input2.text, win.pnl1.input1.text).replace("temp", ""));
		}
		for (var i = 0; i < firstSetOfFiles.length; i++) {
			firstSetOfFiles[i].rename(firstSetOfFiles[i].name.replace(win.pnl1.input1.text, win.pnl1.input2.text).replace("temp", ""));
		}
		alert("DONE");	}
	
	win.center();
	win.show();
}
main();