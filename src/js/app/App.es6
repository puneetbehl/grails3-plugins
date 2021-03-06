grailsplugins.App = class {

    constructor() {
        this.isEmbedded = window.self !== window.top;
        this.baseUrl = 'https://grails.org/plugins.html';

        if (!this.isEmbedded) {
            $('body').html(Handlebars.templates['moved']())
        }

        $('.resources-dropdown-mobile-toggle').click(e => {
            e.preventDefault();
            e.stopPropagation();
            $('.resources-dropdown-toggle').click();
        });

        $('body').delegate('a[data-internal]', 'click', e => {
            e.preventDefault();
            let href = $(e.currentTarget).attr('href');
            window.location.hash = href.substr(this.baseUrl.length);
        });

        grailsplugins.Plugins.fetch().then(this.onPluginsFetch.bind(this));

        $('body').removeClass('hide');
    }

    onHashChange(e) {
        e.preventDefault();
        e.stopPropagation();
        this.route();
    }

    route() {
        let hashId = window.location.hash;

        if (hashId && hashId.indexOf('#plugin/') === 0) {
            this.showPlugin(hashId.substring('#plugin/'.length));
        } else {
            let q = hashId && hashId.indexOf('#q/') === 0 ? hashId.substring('#q/'.length) : '';
            this.showSearch(q);
        }
        ga('send', 'pageview', hashId);
    }

    addHashChangeListener() {
        if (this.isEmbedded) {
            window.addEventListener('hashchange', () => {
                window.parent.postMessage({
                    type: 'hashchange',
                    hash: window.location.hash
                }, '*');
            }, false);
            window.addEventListener('message', e => {
                let hash = e.data.hash;
                if (e.data.type === 'init') {
                    window.location.hash = hash;
                    this.show();
                } else {
                    if (window.location.hash !== hash) { // forward/back nav
                        history.replaceState(undefined, undefined, hash ? hash : '#');
                    }
                }
                this.route();
            }, false);
        } else {
            window.addEventListener('hashchange', this.onHashChange.bind(this), false);
        }
    }

    onPluginsFetch(plugins) {
        this.addHashChangeListener();

        this.plugins = plugins;
        this.searchView = new grailsplugins.views.SearchView($('.search-page'), this.plugins);
        this.pluginView = new grailsplugins.views.PluginView($('.plugin-page'));

        if (!this.isEmbedded) {
            this.show();
            this.route();
        }
    }

    show() {
        $('.page-loading').remove();
        $('.main-content').removeClass('hide');
    }

    showSearch(q = '') {
        document.title = 'Grails 3 Plugins';
        this.searchView.$el.removeClass('hide');
        this.pluginView.$el.addClass('hide');
        this.searchView.search(q);
    }

    showPlugin(pluginName) {
        document.title = pluginName;
        this.searchView.$el.addClass('hide');
        this.pluginView.$el.removeClass('hide');
        let plugin = this.plugins.findByName(pluginName);
        this.pluginView.showPlugin(plugin);
    }
};
