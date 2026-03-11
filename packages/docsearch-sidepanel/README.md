# typesense-docsearch-sidepanel

React package for [DocSearch Sidepanel](http://docsearch.algolia.com/), a standalone Ask AI chat panel.

## Installation

```bash
# or
npm install typesense-docsearch-core@5 typesense-docsearch-sidepanel@5 typesense-docsearch-css@5
```

If you don’t want to use a package manager, you can use a standalone endpoint:

```html
<script src="https://cdn.jsdelivr.net/npm/typesense-docsearch-sidepanel-js"></script>
```

## Get started

DocSearch Sidepanel generates a fully accessible Ask AI chat panel for you.

```jsx App.js
import { DocSearch } from 'typesense-docsearch-core';
import { SidepanelButton, Sidepanel } from 'typesense-docsearch-sidepanel';

// Or using individual imports:
// import { Sidepanel } from 'typesense-docsearch-sidepanel/sidepanel';
// import { SidepanelButton } from 'typesense-docsearch-sidepanel/button';

import 'typesense-docsearch-css/dist/style.css';
import 'typesense-docsearch-css/dist/sidepanel.css';

function App() {
  return (
    <DocSearch>
      <SidepanelButton />
      <Sidepanel
        appId="YOUR_APP_ID"
        apiKey="YOUR_SEARCH_API_KEY"
        agentId="YOUR_AGENT_ID"
      />
    </DocSearch>
  );
}
```

## Documentation

[Read documentation →](https://docsearch.algolia.com/docs/packages/sidepanel/getting-started)
