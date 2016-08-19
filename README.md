# rangeSelectable jQuery plugin
**rangeSelectable** is a plugin that modifies jQuery Selectable to select time ranges.

![rangeSelectable demo](http://i.imgur.com/u4xrIYY.gif)


## Usage

``` html
<ol id="selectable">
  <li>1</li>
  <li>2</li>
  <li>3</li>
  <li>4</li>
</ol>
```

``` javascript
$( document ).ready( function() {

  $( '#selectable' ).rangeSelectable({
    filter: 'li'
  });

});
```
## License

This work is licensed under the MIT License.
