<?php

namespace Flynt\Components\SliderMedia;

use Flynt\Features\Components\Component;
use Flynt\Utils\Asset;
use Flynt\Utils\Oembed;

add_filter('Flynt/addComponentData?name=SliderMedia', function ($data, $parentData) {
    add_action('wp_enqueue_scripts', function () {
        Component::enqueueAssets('SliderMedia', [
            [
                'name' => 'slick-carousel',
                'path' => 'vendor/slick.js',
                'type' => 'script'
            ],
            [
                'name' => 'slick-carousel',
                'path' => 'vendor/slick.css',
                'type' => 'style'
            ],
            [
                'name' => 'lazysizes',
                'type' => 'script',
                'path' => 'vendor/lazysizes.js'
            ],
            [
                'name' => 'rellax',
                'type' => 'script',
                'path' => 'vendor/rellax.js'
            ]
        ]);
    });

    // NOTE: if component is used in pageHeader get and set data
    if (isset($data['useCase']) && $data['useCase'] === 'pageHeader' && isset($parentData['post']->fields['pageHeader'])) {
        $data = array_merge($data, $parentData['post']->fields['pageHeader']);
    }

    $data['jsData'] = json_encode([
        'useCase' => isset($data['useCase']) ? $data['useCase'] : false,
        'icons' => [
            'iconLeft' => Asset::getContents('Components/SliderMedia/Assets/ico-ui-chevron-shadow-left.svg'),
            'iconRight' => Asset::getContents('Components/SliderMedia/Assets/ico-ui-chevron-shadow-right.svg')
        ],
        'autoplay' => $data['globalOptionSet']['autoplay'] ?? 0,
        'autoplaySpeed' => $data['globalOptionSet']['autoplaySpeed'] ?? 3
    ]);

    $data['mediaSlides'] = array_map(function ($item) {
        if ($item['slide']['mediaType'] == 'oembed') {
            if (strpos($item['slide']['oembed'], 'youtube') !== false) {
                $item['slide']['oembedLazyLoad'] = Oembed::setSrcAsDataAttribute(
                    $item['slide']['oembed'],
                    [
                        'autoplay' => 1,
                        'controls' => 0,
                        'disablekb' => 0,
                        'modestbranding' => 1,
                        'showInfo' => 0,
                        'iv_load_policy' => 3,
                        'rel' => 0
                    ]
                );
            }
            if (strpos($item['slide']['oembed'], 'vimeo') !== false) {
                $item['slide']['oembedLazyLoad'] = Oembed::setSrcAsDataAttribute(
                    $item['slide']['oembed'],
                    [
                        'autoplay' => 1,
                        'byline' => 0,
                        'portrait' => 0,
                        'title' => 0,
                        'loop' => 0
                    ]
                );
            }
        }
        return $item;
    }, $data['mediaSlides']);

    return $data;
}, 10, 2);
