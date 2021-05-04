<?php

namespace Flynt\Components\NavigationMain;

use Flynt\Utils\Asset;
use Flynt\Utils\Options;
use Timber;

add_action('init', function () {
    register_nav_menus([
        'nav_main_main' => __('Navigation Main - Main', 'flynt'),
        'nav_main_side' => __('Navigation Main - Side', 'flynt'),
    ]);
});

add_filter('Flynt/addComponentData?name=NavigationMain', function ($data) {
    $data['navigation'] = [
        'main' => new Timber\Menu('nav_main_main'),
        'side' => new Timber\Menu('nav_main_side'),
    ];

    $area = [
        'header' => get_field('areaHeader', $data['navigation']['main']),
        'main' => get_field('areaMain', $data['navigation']['main']),
        'cta' => get_field('areaCta', $data['navigation']['main']),
    ];

    $data['area'] = [
        'header' => [
            'quicklink' => $area['header']['quicklink'],
        ],
        'main' => [
            'quicklink' => $area['main']['quicklink'],
        ],
        'cta' => [
            'button' => $area['cta']['button'],
        ],
    ];

    $data['brand'] = [
        'logo' => Asset::getContents('Components/NavigationMain/Assets/logo-text.svg'),
        'alt' => get_bloginfo('name')
    ];

    $data['ico'] = [
        'search' => Asset::getContents('Components/NavigationMain/Assets/ico-ui-search.svg'),
        'artwork' => Asset::getContents('Components/NavigationMain/Assets/ico-ui-artwork.svg')
    ];

    $data['languages'] = [
        'set' => apply_filters('wpml_active_languages', null, ['skip_missing' => false]),
        'current' => apply_filters('wpml_current_language', null)
    ];

    return $data;
});

Options::addTranslatable('NavigationMain', [
    [
        'label' => 'Search',
        'name' => 'searchTranslatable',
        'type' => 'group',
        'sub_fields' => [
            [
                'label' => 'Link',
                'name' => 'link',
                'type' => 'link',
                'return_format' => 'array'
            ],
        ]
    ]
]);
