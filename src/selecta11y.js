import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;

class ComboboxAutocomplete {

  static ItemSelectedPre = `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" class="">
    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
  </svg>`;

  static ItemSelectedPost = `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" class="">
    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
  </svg>`;

  constructor(control, data, initialSelection = [], key = 'id', fAsOption, fAsLabel) {

    this.key = key;

    this.fAsOption = fAsOption ? fAsOption : this.#defaultfAsOption;
    this.fAsLabel = fAsLabel ? fAsLabel : this.#defaultfAsLabel;

    this.control = control;
    this.data = data;

    this.activeItems = initialSelection.map((item) => item.toString());

    this.searchKeyActions = {
      GO_FIRST_ITEM: 0,
      CLOSE_DROPDOWN: 1,
      FILTER: 3
    };

    this.itemActions = {
      TOGGLE_SELECT: 0,
    };

    this.dropdownMenuCombo = control.querySelector('.dropdownMenuCombo');
    this.searchInput = control.querySelector('.dropdowninputsearch');

    this.#initializeDropdownEventListeners();
    this.#initializeSearchKeyUpEventListeners();
    this.#initializeSearchKeyDownEventListeners();

    this.#UpdateCombo();

  }

  // ----------- UiTransformers -----------

  // Doc: get a item from data and returns html to show item in combo
  // This is the default behavior, but you can override it passing a function to constructor
  #defaultfAsLabel(item) {
    // get content    
    const content = item["text"];

    // for each content create element like: <span class="badge rounded-pill text-bg-primary">Primary</span>
    const span = document.createElement('span');
    span.classList.add('badge');
    span.classList.add('rounded-pill');
    span.classList.add('text-bg-primary');
    span.innerHTML = content;

    return span;
  }

  // Doc: get a item from data and returns html to show item in dropdown
  // This is the default behavior, but you can override it passing a function to constructor
  #defaultfAsOption(item) {
    // get content    
    const content = item["text"];

    return content;
  }


  // ----------- Helpers -----------

  // Doc: when dropdown is opened, move selected items to top
  #MoveSelectedItemsToTop(data) {
    // selected items
    const aactive = data.filter((item) => this.activeItems.includes(item[this.key].toString()));
    // unselecte items
    const bactive = data.filter((item) => !this.activeItems.includes(item[this.key].toString()));
    // concat
    const concat = aactive.concat(bactive);
    //return
    return concat;
  }

  // ----------- Dropdown events -----------

  // Doc: stuff to do when dropdown is opened
  #initializeDropdownEventListeners() {
    this.dropdownMenuCombo.addEventListener('shown.bs.dropdown', () => {
      this.searchInput.value = "";
      this.#FillDropdownItems(this.data);
      this.searchInput.focus();
    });
  }

  // ----------- Search events -----------

  // Doc: stuff to do on search input keydown: go up/down
  #initializeSearchKeyDownEventListeners() {
    this.searchInput.addEventListener('keydown', (e) => {
      const action = this.#searchKeyDown2Action(e);
      if (action === undefined) return;
      this.#doSearchAction(action);
    });
  }

  // Doc: stuff to do on search input keyup: filter data
  #initializeSearchKeyUpEventListeners() {
    this.searchInput.addEventListener('keyup', (e) => {
      const action = this.#searchKeyUpAction(e);
      if (action === undefined) return;
      this.#doSearchAction(action);
    });
  }

  // Doc: map search input keydown to action
  #searchKeyDown2Action(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      return this.searchKeyActions.GO_FIRST_ITEM;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      return this.searchKeyActions.CLOSE_DROPDOWN;
    }
  }

  // Doc: map search input keyup to action
  #searchKeyUpAction(e) {
    return this.searchKeyActions.FILTER;
  }

  // Doc: do actions over search input
  #doSearchAction(action) {
    switch (action) {
      case this.searchKeyActions.GO_FIRST_ITEM:
        const firstDropdownItem = this.control.querySelector('li.dropdown-item');
        if (!firstDropdownItem) return;
        firstDropdownItem.tabIndex = 0;
        firstDropdownItem.focus();
        break;
      case this.searchKeyActions.CLOSE_DROPDOWN:
        new bootstrap.Dropdown(this.dropdownMenuCombo, {}).toggle();
        this.dropdownMenuCombo.focus();
        break;
      case this.searchKeyActions.FILTER:
        const value = this.searchInput.value;
        const filtered = this.data.filter((item) => item.text.toLowerCase().includes(value.toLowerCase()));
        this.#FillDropdownItems(filtered);
        break;
    }
  }
  // ----------- Item events -----------

  // Doc: stuff to do on item keydown: select / unselect
  #initializeItemEventListeners(item) {
    item.addEventListener('keydown', (e) => {
      const action = this.#itemKeyDown2Action(e);
      if (action === undefined) return;
      e.preventDefault();
      this.#doItemAction(action, item);
    });

    item.addEventListener('click', (e) => {
      const action = this.#itemClick2Action(e);
      if (action === undefined) return;
      e.preventDefault();
      this.#doItemAction(action, item);
    });
  }

  // Doc: map spacebar to toggle select
  #itemKeyDown2Action(e) {
    if (e.key === " ") {
      return this.itemActions.TOGGLE_SELECT;
    }
  }

  // Doc: map click to toggle select
  #itemClick2Action(e) {
    return this.itemActions.TOGGLE_SELECT;
  }

  // Doc: do actions over item: select / unselect
  #doItemAction(action, item) {
    switch (action) {
      case this.itemActions.TOGGLE_SELECT:
        const value = item.getAttribute('data-value');
        const alreadyactive = this.activeItems.includes(value);

        if (alreadyactive) {
          this.activeItems = this.activeItems.filter((item) => item.toString() !== value.toString());
          this.#clearUiSelection(item);
        } else {
          this.activeItems.push(value);
          this.#setUiSelection(item);
        }
        break;
    }
  }

  // ----------- UI Refresh -----------

  // Doc: fill dropdown from data creating html elements
  #FillDropdownItems(data) {

    const sorteddata = this.#MoveSelectedItemsToTop(data);
    const items = this.control.querySelector('.items');
    items.innerHTML = "";

    /*
    For each item in data, should create an element like this inside .items:

    <li class="dropdown-item" role="menuitemcheckbox" aria-checked="false" data-value=4 tabindex="1">
        <div class="dropdown-item-selector pre-selector"></div>
        <div class="dropdown-item-content">Action 4</div>
        <div class="dropdown-item-selector post-selector"></div>
    </li>
    */
    sorteddata.forEach(element => {
      const value = element[this.key].toString();

      const li = document.createElement('li');
      li.classList.add('dropdown-item');
      li.setAttribute('role', 'menuitemcheckbox');
      li.setAttribute('aria-checked', 'false');
      li.setAttribute('data-value', value);
      li.setAttribute('tabindex', '1');

      const preSelector = document.createElement('div');
      preSelector.classList.add('dropdown-item-selector');
      preSelector.classList.add('pre-selector');

      const content = document.createElement('div');
      content.classList.add('dropdown-item-content');
      content.innerHTML = element.text;

      const postSelector = document.createElement('div');
      postSelector.classList.add('dropdown-item-selector');
      postSelector.classList.add('post-selector');

      li.appendChild(preSelector);
      li.appendChild(content);
      li.appendChild(postSelector);

      items.appendChild(li);

      if (this.activeItems.includes(value)) {
        this.#setUiSelection(li);
      }

      this.#initializeItemEventListeners(li);

    });
  }

  // Doc: clear ui item selection
  #clearUiSelection(item) {
    // icons
    const selectedPre = item.querySelector('.dropdown-item-selector.pre-selector');
    selectedPre.innerHTML = "";
    const selectedPost = item.querySelector('.dropdown-item-selector.post-selector');
    selectedPost.innerHTML = "";

    // aria
    item.setAttribute('aria-checked', 'false');

    // combo
    this.#UpdateCombo();
  }

  // Doc: set ui item selection
  #setUiSelection(item) {
    // icons
    const selectedPre = item.querySelector('.dropdown-item-selector.pre-selector');
    selectedPre.innerHTML = ComboboxAutocomplete.ItemSelectedPre;
    const selectedPost = item.querySelector('.dropdown-item-selector.post-selector');
    selectedPost.innerHTML = ComboboxAutocomplete.ItemSelectedPost;

    // aria
    item.setAttribute('aria-checked', 'true');

    // combo
    this.#UpdateCombo();
  }

  // Doc: update combo with selected items
  #UpdateCombo() {
    // Clear combo 
    this.dropdownMenuCombo.innerHTML = "";

    // for each active item
    for (const item of this.data) {

      // get value
      const value = item[this.key];

      // not active, skip
      const active = this.activeItems.includes(value.toString());
      if (!active) continue;

      // figure up content    
      const content = this.fAsLabel(item);

      // append to combo
      this.dropdownMenuCombo.appendChild(content);
    }
  }

}

// --- invoking combo ---

const control = document.getElementById('mycustomselectid');

// get pizza ingredients
const data = [
  { id: 1, text: 'Chess' },
  { id: 2, text: 'Tomato' },
  { id: 3, text: 'Pepperoni' },
  { id: 4, text: 'Mushrooms' },
  { id: 5, text: 'Onions' },
  { id: 6, text: 'Sausage' },
  { id: 7, text: 'Bacon' },
  { id: 8, text: 'Extra cheese' },
];

const initialSelection = [1]; // Chess is selected

new ComboboxAutocomplete(
  control,
  data = data,
  initialSelection = initialSelection
);