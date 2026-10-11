// Oyunun kullandığı Phaser oyun nesneleri: phaser/src/gameobjects/index.js'in aynısı, sadece hiç kullanmadığımız
// nesneler (parçacık, video, bitmap yazı, 3B ağ, ışık, gölgelendirici, karo resim...) çıkarıldı. Sadece derlemede
// (src/phaserHafif.cjs). Yeni bir nesne türü (ör. this.add.sprite, particles) gerekirse buraya eklenir.

var GameObjects = {
    Events: require('phaser/src/gameobjects/events'),
    DisplayList: require('phaser/src/gameobjects/DisplayList'),
    GameObjectCreator: require('phaser/src/gameobjects/GameObjectCreator'),
    GameObjectFactory: require('phaser/src/gameobjects/GameObjectFactory'),
    UpdateList: require('phaser/src/gameobjects/UpdateList'),
    Components: require('phaser/src/gameobjects/components'),
    GetCalcMatrix: require('phaser/src/gameobjects/GetCalcMatrix'),
    BuildGameObject: require('phaser/src/gameobjects/BuildGameObject'),
    BuildGameObjectAnimation: require('phaser/src/gameobjects/BuildGameObjectAnimation'),
    GameObject: require('phaser/src/gameobjects/GameObject'),
    Container: require('phaser/src/gameobjects/container/Container'),
    DOMElement: require('phaser/src/gameobjects/domelement/DOMElement'),
    Graphics: require('phaser/src/gameobjects/graphics/Graphics'),
    Group: require('phaser/src/gameobjects/group/Group'),
    Image: require('phaser/src/gameobjects/image/Image'),
    Layer: require('phaser/src/gameobjects/layer/Layer'),
    Sprite: require('phaser/src/gameobjects/sprite/Sprite'),
    Text: require('phaser/src/gameobjects/text/Text'),
    GetTextSize: require('phaser/src/gameobjects/text/GetTextSize'),
    MeasureText: require('phaser/src/gameobjects/text/MeasureText'),
    TextStyle: require('phaser/src/gameobjects/text/TextStyle'),
    Zone: require('phaser/src/gameobjects/zone/Zone'),
    Shape: require('phaser/src/gameobjects/shape/Shape'),
    Arc: require('phaser/src/gameobjects/shape/arc/Arc'),
    Ellipse: require('phaser/src/gameobjects/shape/ellipse/Ellipse'),
    Line: require('phaser/src/gameobjects/shape/line/Line'),
    Polygon: require('phaser/src/gameobjects/shape/polygon/Polygon'),
    Rectangle: require('phaser/src/gameobjects/shape/rectangle/Rectangle'),
    Star: require('phaser/src/gameobjects/shape/star/Star'),
    Triangle: require('phaser/src/gameobjects/shape/triangle/Triangle'),

    Factories: {
        Container: require('phaser/src/gameobjects/container/ContainerFactory'),
        DOMElement: require('phaser/src/gameobjects/domelement/DOMElementFactory'),
        Graphics: require('phaser/src/gameobjects/graphics/GraphicsFactory'),
        Group: require('phaser/src/gameobjects/group/GroupFactory'),
        Image: require('phaser/src/gameobjects/image/ImageFactory'),
        Layer: require('phaser/src/gameobjects/layer/LayerFactory'),
        Sprite: require('phaser/src/gameobjects/sprite/SpriteFactory'),
        Text: require('phaser/src/gameobjects/text/TextFactory'),
        Zone: require('phaser/src/gameobjects/zone/ZoneFactory'),
        Arc: require('phaser/src/gameobjects/shape/arc/ArcFactory'),
        Ellipse: require('phaser/src/gameobjects/shape/ellipse/EllipseFactory'),
        Line: require('phaser/src/gameobjects/shape/line/LineFactory'),
        Polygon: require('phaser/src/gameobjects/shape/polygon/PolygonFactory'),
        Rectangle: require('phaser/src/gameobjects/shape/rectangle/RectangleFactory'),
        Star: require('phaser/src/gameobjects/shape/star/StarFactory'),
        Triangle: require('phaser/src/gameobjects/shape/triangle/TriangleFactory')
    },

    Creators: {
        Container: require('phaser/src/gameobjects/container/ContainerCreator'),
        Graphics: require('phaser/src/gameobjects/graphics/GraphicsCreator'),
        Group: require('phaser/src/gameobjects/group/GroupCreator'),
        Image: require('phaser/src/gameobjects/image/ImageCreator'),
        Layer: require('phaser/src/gameobjects/layer/LayerCreator'),
        Sprite: require('phaser/src/gameobjects/sprite/SpriteCreator'),
        Text: require('phaser/src/gameobjects/text/TextCreator'),
        Zone: require('phaser/src/gameobjects/zone/ZoneCreator')
    }
};

module.exports = GameObjects;
