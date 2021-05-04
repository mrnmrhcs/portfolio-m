<?php

namespace Flynt\Components\AccordionTickets;

use Flynt\Api;
use Flynt\Utils\Options;

Api::registerFields('AccordionTickets', [
    'layout' => [
        'name' => 'AccordionTickets',
        'label' => 'Accordion: Tickets',
        'sub_fields' => [
            [
                'label' => 'General',
                'name' => 'generalTab',
                'type' => 'tab',
                'placement' => 'top',
                'endpoint' => 0
            ],
            [
                'label' => '',
                'name' => 'header',
                'type' => 'group',
                'sub_fields' => [
                    [
                        'label' => 'Title',
                        'name' => 'title',
                        'placeholder' => 'Component Title',
                        'type' => 'text',
                        'required' => 0,
                        'wrapper' =>  [
                            'width' => '50'
                        ]
                    ],
                    [
                        'label' => 'Event',
                        'name' => 'event',
                        'type' => 'text',
                        'required' => 0,
                        'wrapper' =>  [
                            'width' => '50'
                        ]
                    ],
                ]
            ],
            [
                'label' => '',
                'name' => 'tabs',
                'type' => 'repeater',
                'collapsed' => '',
                'layout' => 'row',
                'button_label' => 'Add Tab',
                'sub_fields' => [
                    [
                        'label' => 'Tab',
                        'name' => 'title',
                        'placeholder' => 'Title',
                        'type' => 'text',
                        'required' => 1,
                    ],
                    [
                        'label' => 'Tickets',
                        'name' => 'tickets',
                        'type' => 'repeater',
                        'collapsed' => '',
                        'layout' => 'block',
                        'button_label' => 'Add',
                        'sub_fields' => [
                            [
                                'label' => 'Ticket',
                                'name' => 'generalTab',
                                'type' => 'tab',
                                'placement' => 'top',
                                'endpoint' => 0
                            ],
                            [
                                'label' => 'Title',
                                'name' => 'title',
                                'type' => 'text',
                                'required' => 1,
                                'wrapper' =>  [
                                    'width' => '40'
                                ]
                            ],
                            [
                                'label' => 'Ticket Info',
                                'name' => 'infoText',
                                'type' => 'text',
                                'maxlength' => 98,
                                'wrapper' =>  [
                                    'width' => '60'
                                ]
                            ],
                            [
                                'label' => 'Intro',
                                'name' => 'introText',
                                'type' => 'text',
                            ],
                            [
                                'label' => 'Description',
                                'name' => 'description',
                                'type' => 'wysiwyg',
                                'tabs' => 'visual,text',
                                'toolbar' => 'full',
                                'media_upload' => 0,
                                'delay' => 1,
                            ],
                            [
                                'label' => 'Add List',
                                'name' => 'listAccordion',
                                'type' => 'accordion',
                                'open' => 0,
                                'multi_expand' => 1,
                                'endpoint' => 0
                            ],
                            [
                                'label' => '',
                                'name' => 'facts',
                                'type' => 'repeater',
                                'layout' => 'row',
                                'collapsed' => '',
                                'min' => 2,
                                'max' => 8,
                                'layout' => 'row',
                                'button_label' => 'Add',
                                'sub_fields' => [
                                    [
                                        'label' => 'Item',
                                        'name' => 'text',
                                        'type' => 'text',
                                        'required' => 0,
                                        'maxlength' => 32,
                                    ],
                                ]
                            ],
                            [
                                'label' => '',
                                'name' => 'listAccordionEND',
                                'type' => 'accordion',
                                'open' => 0,
                                'multi_expand' => 1,
                                'endpoint' => 1
                            ],
                            [
                                'label' => 'Price',
                                'name' => 'price',
                                'type' => 'text',
                                'prepend' => '€',
                                'wrapper' =>  [
                                    'width' => '40'
                                ]
                            ],
                            [
                                'label' => 'Notice',
                                'name' => 'notice',
                                'type' => 'text',
                                'maxlength' => 32,
                                'wrapper' =>  [
                                    'width' => '60'
                                ]
                            ],
                            [
                                'label' => 'Add Link',
                                'name' => 'linkAccordion',
                                'type' => 'accordion',
                                'open' => 0,
                                'multi_expand' => 1,
                                'endpoint' => 0
                            ],
                            [
                                'label' => '',
                                'name' => 'link',
                                'type' => 'link',
                                'return_format' => 'array'
                            ],
                            [
                                'label' => '',
                                'name' => 'linkAccordionEnd',
                                'type' => 'accordion',
                                'open' => 0,
                                'multi_expand' => 1,
                                'endpoint' => 1
                            ],
                            [
                                'label' => 'Media',
                                'name' => 'mediaTab',
                                'type' => 'tab',
                                'placement' => 'top',
                                'endpoint' => 0
                            ],
                            [
                                'label' => '',
                                'name' => 'image',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                                'library' => 'all',
                                'mime_types' => 'jpg,jpeg,png',
                                'min_width' => 1200,
                                'min_height' => 900,
                                'max_size' => 1.5,
                                'instructions' => 'Resolution: 1200 x 900px Minimum - Ratio: 4:3 - Background: Transparent/White - Format: PNG, JPG',
                            ],
                            [
                                'label' => 'Options',
                                'name' => 'optionsTab',
                                'type' => 'tab',
                                'placement' => 'top',
                                'endpoint' => 0
                            ],
                            Api::loadFields('FieldVariables', 'themeTicket'),
                        ]
                    ],
                ]
            ],
            [
                'label' => 'Options',
                'name' => 'optionsTab',
                'type' => 'tab',
                'placement' => 'top',
                'endpoint' => 0
            ],
            Api::loadFields('FieldVariables', 'theme'),
        ],
    ],
]);

Options::addTranslatable('AccordionTickets', [
    [
        'label' => 'General',
        'name' => 'generalTranslatable',
        'type' => 'group',
        'sub_fields' => [
            [
                'label' => 'Label - Button/Link - Default',
                'name' => 'buyTicket',
                'type' => 'text',
                'default_value' => 'Tickets kaufen',
                'wrapper' => [
                    'width' => '50',
                ],
            ],
            [
                'label' => 'Notice - No Tickets',
                'name' => 'noTicketsNotice',
                'type' => 'text',
                'default_value' => 'Keine Tickets verfügbar.',
                'wrapper' => [
                    'width' => '50',
                ],
            ],
        ],
    ],
]);
