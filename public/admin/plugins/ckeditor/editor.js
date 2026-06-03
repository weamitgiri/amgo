
$(function() {
    // CKEditor Standard
    $('textarea#ckeditor_standard').ckeditor({
        height: '150px',
        toolbar: [{
            name: 'document',
            items: ['Source', '-', 'NewPage', 'Preview', '-', 'Templates']
        }, // Defines toolbar group with name (used to create voice label) and items in 3 subgroups.
            ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'], // Defines toolbar group without name.
            {
                name: 'basicstyles',
                items: ['Bold', 'Italic']
            }
        ]
    });

    // CKEditor Full
    $('textarea#ckeditor_full').ckeditor({
        height: '200px'
    });

    // The "instanceCreated" event is fired for every editor instance created.
    CKEDITOR.on('instanceCreated', function(event) {
        var editor = event.editor,
            element = editor.element;

        // Customize editors for headers and tag list.
        // These editors don't need features like smileys, templates, iframes etc.
        if (element.is('h1', 'h2', 'h3') || element.getAttribute('id') == 'taglist') {
            // Customize the editor configurations on "configLoaded" event,
            // which is fired after the configuration file loading and
            // execution. This makes it possible to change the
            // configurations before the editor initialization takes place.
            editor.on('configLoaded', function() {

                // Remove unnecessary plugins to make the editor simpler.
                editor.config.removePlugins = 'colorbutton,find,flash,font,' +
                    'forms,iframe,image,newpage,removeformat,' +
                    'smiley,specialchar,stylescombo,templates';

                // Rearrange the layout of the toolbar.
                editor.config.toolbarGroups = [{
                    name: 'editing',
                    groups: ['basicstyles', 'links']
                }, {
                    name: 'undo'
                }, {
                    name: 'clipboard',
                    groups: ['selection', 'clipboard']
                }, {
                    name: 'about'
                }];
            });
        }
    });
  
  
});