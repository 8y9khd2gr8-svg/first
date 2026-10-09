import Phaser from 'phaser';

// Aşama 0: Kurulumun çalıştığını gösteren ilk ekran.
// Karaktere ya da "Zıpla!" düğmesine dokununca karakter zıplar.
export class MerhabaScene extends Phaser.Scene {
  private karakter!: Phaser.GameObjects.Container;
  private zipliyor = false;

  constructor() {
    super('Merhaba');
  }

  create() {
    const { width, height } = this.scale.gameSize;
    const ortaX = width / 2;

    // Çimen
    this.add.rectangle(ortaX, height - 150, width, 300, 0x7cc66b);

    this.add
      .text(ortaX, 200, 'Merhaba Yağız!', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: '72px',
        color: '#ffffff',
        stroke: '#2b6c99',
        strokeThickness: 10,
      })
      .setOrigin(0.5);

    this.add
      .text(ortaX, 300, 'Dünya turuna hazır mısın?', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '40px',
        color: '#1f4e6e',
      })
      .setOrigin(0.5);

    this.karakter = this.karakterCiz(ortaX, height - 420);

    const dugme = this.add.container(ortaX, height - 130);
    const dugmeArka = this.add.rectangle(0, 0, 420, 140, 0xff8a3d).setStrokeStyle(8, 0xffffff);
    const dugmeYazi = this.add
      .text(0, 0, 'Zıpla!', { fontFamily: 'Arial, sans-serif', fontSize: '64px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5);
    dugme.add([dugmeArka, dugmeYazi]);
    dugmeArka.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.zipla());
    this.karakter.setInteractive(new Phaser.Geom.Circle(0, 0, 120), Phaser.Geom.Circle.Contains)
      .on('pointerdown', () => this.zipla());

    // Düğme hafifçe "nefes alır" ki çocuk nereye basacağını anlasın.
    this.tweens.add({ targets: dugme, scale: 1.06, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  // Geçici, basit bir karakter: ileride gerçek çizimle değişecek.
  private karakterCiz(x: number, y: number) {
    const govde = this.add.circle(0, 0, 120, 0xffc93c).setStrokeStyle(8, 0xe0a100);
    const solGoz = this.add.circle(-40, -25, 16, 0x333333);
    const sagGoz = this.add.circle(40, -25, 16, 0x333333);
    const gulumseme = this.add.arc(0, 20, 50, 20, 160, false).setStrokeStyle(8, 0x333333).setClosePath(false);
    return this.add.container(x, y, [govde, solGoz, sagGoz, gulumseme]);
  }

  private zipla() {
    if (this.zipliyor) return;
    this.zipliyor = true;
    this.tweens.add({
      targets: this.karakter,
      y: this.karakter.y - 220,
      duration: 350,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => (this.zipliyor = false),
    });
  }
}
