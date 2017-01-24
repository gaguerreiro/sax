# Sax

### Sax help you to focus only HTML, decreasing JS work. 
#### Created using [AIDAX Doc](http://doc.aidax.com.br/)

## Installation

```sh
bower install sax
```

or

```html
// After AIDAX script (recommended)
<script src="sax.min.js"/>
```

## Attributes

### *> sax-track or sax-track="Name of Event"*

Required to track events.
Place in all element that you want to track.

Set a value to force a custom name to event (recommended). If keep blank, Sax will generate a name, based on: title, alt, name, id or class of the element.

```html
// event: "name of event"
<a id="link1" title="Name of Event" sax-track>Link</a>

// event: "event click"
<a id="link2" sax-track="Event Click">Link 2</a>

// event: "send"
<input name="send" type="submit|button" />

// event: "input_form-inputs"
<input class="form-inputs" type="text|email|number|etc..." sax-track/>

// event: "input text area"
<textarea sax-track="Input Text Area"/>

// event: "was selected"
<select sax-track="Was selected"/>
```


### *> sax-track-properties="List of properties"*

Required to send properties of events. Accept JSON or CSV formats.

```html
// JSON format
<a sax-track-properties='{"property":"Value","property2":"Value 2",}' sax-track="Event 1">Link</a>

// CSV format
<a sax-track-properties="property:Value;property2:Value 2" sax-track="Event 2">Link 2</a>
```

### *> sax-identify*

Required to identify user and create a profile. Usually used in input fields and no needs value.

The inputted value will be used as property value sent.

```html
<input type="text|email|number|etc..." sax-identify/>
<textarea sax-identify/>
<select sax-identify/>
```

### *> sax-property="Name of Property"*

Used on Identity elements to set a name to property sent (recommended). If blank, Sax will generate a name based on: input.name, input.id or classes.

The inputted value will be used as property value sent.

```html
<input type="text|email|number|etc..." sax-identify sax-property="Name of user"/>
<textarea sax-identify sax-property="Message of user"/>
<select sax-identify sax-property="Gender of user"/>
```

### *> sax-identify-properties="List of properties"*

Used to send extras properties from user. Accept JSON or CSV formats.

This list will be combined with Property:Value setted above.

```html
// JSON format
<input sax-track-properties='{"property":"Value","property2":"Value 2",}' sax-identify />

// CSV format
<input sax-track-properties="property:Value;property2:Value 2" sax-identify />
```

### *> sax-email*

Used with Identify to force an element to be an Email property. No need value.

```html
<input type="text|email|number|etc..." sax-identify sax-property="Email of user" sax-email/>
```

### *> sax-not-prevent*

Optional attribute, used commonly in track elements, to force Sax never prevent the default event execution, like a click.

```html
<a href="http://aidax.com.br/" sax-track sax-not-prevent>Link</a>
```


## Event Listeners

Sax will add custom classes to all elements, to use like references, and an event listener based on his types.

If element has **sax-not-prevent** attribute, the default event will never be prevented, but if not, Sax will check if event needs to be prevented to run aidax, before to be executed.

```html
// On click
<a href="http://aidax.com.br/" class="... sax-track-0" sax-track>Link</a>
<div class="... sax-track-1" sax-track="Event Click" sax-not-prevent>Link 2</div>
<li class="... sax-track-2" sax-track sax-not-prevent></li>
<input class="... sax-track-3" type="submit|button" />

// On blur
<input type="text|email|number|etc..." sax-track class="... sax-track-4"/>
<textarea sax-track="Input Text Area" class="... sax-track-5"/>

// On change
<select sax-track="Was selected" class="... sax-track-6"/>
```
