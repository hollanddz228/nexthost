#!/bin/bash
# ==========================================
# 1-2 тапсырмалар: LVM баптау және пішімдеу (форматтау)
# ==========================================

# 1. Жаңа физикалық дискіні (Physical Volume) инициализациялау
# /dev/sdb дискісі қосылған деп есептейміз
pvcreate /dev/sdb

# 2. 'storage_vg' деген атпен томдар тобын (Volume Group) құру
vgcreate storage_vg /dev/sdb

# 3. Бос орынның 100%-ын пайдаланып, 'storage_lv' логикалық томын (Logical Volume) құру
lvcreate -l 100%FREE -n storage_lv storage_vg

# 4. Жасалған томды ext4 файлдық жүйесіне пішімдеу
mkfs.ext4 /dev/storage_vg/storage_lv

# 5. Монтаждауға (тіркеуге) арналған директорияны құру
mkdir -p /mnt/storage

# 6. Логикалық томды монтаждау
mount /dev/storage_vg/storage_lv /mnt/storage

# 7. Жүйе қайта қосылғанда автоматты түрде монтаждалуы үшін /etc/fstab файлына жазу
echo "/dev/storage_vg/storage_lv /mnt/storage ext4 defaults 0 0" >> /etc/fstab

echo "LVM сәтті құрылды және монтаждалды!"

# ==========================================
# 3-тапсырма: Пішімделген шығару (PV = VG)
# ==========================================
echo "LVM құрылымын шығару:"
# pvs командасы деректерді шығарады, ал awk оны қажетті пішімге келтіреді
pvs --noheadings -o pv_name,vg_name | awk '{print $1" = "$2}'