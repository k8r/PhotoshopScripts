# Photoshop Scripts
## Export Groups
This script exports each group (or layer set) as a separate .png. You have the option to set the scale of your source art so you get multiple .pngs for each group, each at a different scale. One use case is for targeting different mobile screen sizes. For instance, you may want a smaller set of images for the iPhone 4 (2x) than for the iPhone 6 Plus (3x).

### Source Art Scale
![alt tag](https://raw.githubusercontent.com/k8r/PhotoshopScripts/master/exportScriptsScale.png)<br>
The script will export each group at the scale you choose, plus at all smaller scales. So, if you choose 2x, you will get two .pngs for each group - 1x and 2x. The resolutions are calculated by dividing by the scale you set (to get 1x), and multiplying by the scale that is currently being exported. For example, if you were to set your source art to scale 3x, when the script is exporting 2x, it would multiply by the ratio 2/3 to get 2x.

### Export Only Visible Groups
If you check the "Export only visible groups" check-box, groups that are marked invisible will not be exported.

### Groups You Never Want to Export
![alt tag](https://raw.githubusercontent.com/k8r/PhotoshopScripts/master/exportScriptsDoNotExport.png)<br>
If you have some groups you never want to export, include the following text in the group name: DONOTEXPORT.

### Cropping for Each Group
Unless you specify a size for a group, the script will crop out any empty space around your artwork. To specify a size, include a shape layer with a rectangle sized to the size you want, and named "SIZE". See image above.
