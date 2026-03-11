# typesense-docsearch-sidepanel

React package for the Typesense DocSearch Sidepanel, a standalone Ask AI chat panel.

## Installation

```bash
yarn add typesense-docsearch-core@4 typesense-docsearch-sidepanel@4 typesense-docsearch-css@4
# or
npm install typesense-docsearch-core@4 typesense-docsearch-sidepanel@4 typesense-docsearch-css@4
```

If you don’t want to use a package manager, you can use a standalone endpoint:

```html
<script src="https://cdn.jsdelivr.net/npm/typesense-docsearch-sidepanel-js@4"></script>
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
        indexName="YOUR_INDEX_NAME"
        apiKey="YOUR_SEARCH_API_KEY"
        assistantId="YOUR_ASK_AI_ASSISTANT_ID"
      />
    </DocSearch>
  );
}
```

## Documentation

[Read documentation →](https://typesense.org/docs/latest/guide/docsearch.html)
