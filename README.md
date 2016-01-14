# Photoshop Scripts
## Export Groups
This script exports each group (or layer set) as a separate .png. You have the option to set the scale of your source art so you get multiple .pngs for each group, each at a different scale. One use case is for targeting different mobile screen sizes. For instance, you may want a smaller set of images for the iPhone 4 (2x) than for the iPhone 6 Plus (3x).

### Source Art Scale
![alt tag](https://raw.githubusercontent.com/k8r/PhotoshopScripts/master/exportGroupsScale.png)<br>
The script will export each group at the scale you choose, plus at all smaller scales. So, if you choose 2x, you will get two .pngs for each group - 1x and 2x. The resolutions are calculated by dividing by the scale you set (to get 1x), and multiplying by the scale that is currently being exported. For example, if you were to set your source art to scale 3x, when the script is exporting 2x, it would multiply by the ratio 2/3 to get 2x.

### Exporting Only Visible Groups
If you check the "Export only visible groups" check-box, groups that are marked invisible will not be exported.

### Groups You Never Want to Export
![alt tag](https://raw.githubusercontent.com/k8r/PhotoshopScripts/master/exportGroupsDoNotExport.png)<br>
If you have some groups you never want to export, include the following text in the group name: "DONOTEXPORT".

### Cropping for Each Group
![alt tag](https://raw.githubusercontent.com/k8r/PhotoshopScripts/master/exportGroupsShowSizeLayer.png)<br>
Unless you specify a size for a group, the script will crop out any empty space around the group's artwork. To specify a size, include a shape layer named "SIZE", with a rectangle sized to the size you want. See image above.

### Groups Created for Only One Scale
![alt tag](https://raw.githubusercontent.com/k8r/PhotoshopScripts/master/exportGroupsSpecificScale.png)<br>
If you append a scale to the name of a group, that group will only be exported for the scale you indicated. Also, if another group is named the same sans the scale, that group will not be exported for the scale you indicated in the name of the former group. For example, if you have two groups, one named "settings" and the other named "settings@1x", settings@1x will be exported for 1x, and settings will be exported for 2x and 3x (if you indicated the source art scale is 3x). One use case is for when you want a less detailed image for smaller screen sizes. "@" is used to separate the scale from the name, so don't use that character in group names for other reasons.
