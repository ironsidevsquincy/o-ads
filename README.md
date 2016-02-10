# oAds
## Introduction
This module enables display advertising from [Googles DFP Ad server](http://www.google.com/dfp), enables custom behavioural (via [Krux](http://www.krux.com/)), demographics and semantic (via [Admantx](http://admantx.com/)) targeting and audited ad tracking with [Chartbeat](https://chartbeat.com/).

## Installation
Please refer to [Origami quick start instructions](http://registry.origami.ft.com/components/o-ads#section-usage) If you are enabling this module on one of the FT sites please do refer to the [_Integration guidelines_](docs/INTEGRATION.md)

## Browser support

Browsers | Primary Experience | Core Experience
:------: | :----------------: | :-------------:
Chrome   | 35+                | 35+
Firefox  | 30+                | 30+
Safari   | 7+                 | 7+
IE       | 8+                 | 8+

## Requirements
For basic use, a DFP account with Google is required, each targeting/tracking supplier will require their own configuration and setup.

## Documentation
### Quick start
Include o-ads in the build and and add the following markup to the page:

```html
<div class="o-ads" data-o-ads-gpt-unit-name="/6355419/Travel" data-o-ads-formats="MediumRectangle"></div>
```

On initialisation o-ads will request a 300x250 (see Formats below) advert targeted from Google's test network.

### Initialization
The o-ads `init()` method takes a JSON object as it's only argument. The configuration object sets various properties on o-ads.

**Note:** O-ads _**does not**_ initialise with [`o-autoinit`](http://registry.origami.ft.com/components/o-autoinit) like other [FT Origami](http://origami.ft.com/) modules. The final o-ads initialisation happens on `o.DOMContentLoaded`.

This example demonstrates instantiating o-ads, setting the network code and ad formats (position name & sizes) via the configuration object.

```js
const oAds = require('o-ads');
oAds.init({
  network : '5887',
  formats : {
    mpu : {
      sizes : [[300,250],[336,280]]
    },
    leaderboard : {
      sizes : [[728,90],[970,90]]
    }
  }
});
```

### Additional Configuration
We currently support these additional features
- Targeting
- Responsive slots
- Video advertising with companion ads

As well as these 3rd party suppliers
- Krux
- Chartbeat
- Admantx
- Rubicon

In order to use these features you will need to add to your configuration object. This is documented here;
- [Targeting](docs/TARGETING_CONFIG.md)
- [Responsive Slots](docs/RESPONSIVE_SLOTS.md)
- [Video and Companion Advertising](docs/VIDEO_CONFIG.md)
- [Using 3rd Party Providers](docs/DATA_PROVIDERS.md)
- [Slots API](docs/SLOTS_API.md)
