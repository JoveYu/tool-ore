import { fakerZH_CN } from "@faker-js/faker";

export type MockFieldType =
  | "name"
  | "phone"
  | "email"
  | "idcard"
  | "address"
  | "bank_card"
  | "company"
  | "ip"
  | "datetime"
  | "job"
  | "uuid";

export interface MockFieldConfig {
  id: string;
  name: string;
  key: string;
  type: MockFieldType;
}

interface CityDistrictInfo {
  city: string;
  code: string;
  districts: string[];
}

interface ProvinceInfo {
  province: string;
  cities: CityDistrictInfo[];
}

// 真实中国省、市、区/县三级严谨对应数据表
export const CHINA_ADMIN_DIVISIONS: ProvinceInfo[] = [
  {
    province: "北京市",
    cities: [
      {
        city: "北京市",
        code: "110101",
        districts: ["东城区", "西城区", "朝阳区", "海淀区", "丰台区", "石景山区", "昌平区", "大兴区", "通州区", "顺义区"],
      },
    ],
  },
  {
    province: "上海市",
    cities: [
      {
        city: "上海市",
        code: "310101",
        districts: ["黄浦区", "徐汇区", "长宁区", "静安区", "普陀区", "虹口区", "杨浦区", "浦东新区", "闵行区", "宝山区", "嘉定区", "松江区"],
      },
    ],
  },
  {
    province: "天津市",
    cities: [
      {
        city: "天津市",
        code: "120101",
        districts: ["和平区", "河东区", "河西区", "南开区", "河北区", "红桥区", "滨海新区", "西青区", "津南区"],
      },
    ],
  },
  {
    province: "重庆市",
    cities: [
      {
        city: "重庆市",
        code: "500101",
        districts: ["渝中区", "大渡口区", "江北区", "沙坪坝区", "九龙坡区", "南岸区", "北碚区", "渝北区", "巴南区"],
      },
    ],
  },
  {
    province: "广东省",
    cities: [
      {
        city: "广州市",
        code: "440101",
        districts: ["天河区", "越秀区", "海珠区", "荔湾区", "白云区", "黄埔区", "番禺区", "南沙区", "花都区"],
      },
      {
        city: "深圳市",
        code: "440301",
        districts: ["南山区", "福田区", "罗湖区", "宝安区", "龙岗区", "龙华区", "坪山区", "光明区"],
      },
      {
        city: "珠海市",
        code: "440401",
        districts: ["香洲区", "金湾区", "斗门区"],
      },
      {
        city: "佛山市",
        code: "440601",
        districts: ["禅城区", "南海区", "顺德区", "三水区", "高明区"],
      },
      {
        city: "东莞市",
        code: "441901",
        districts: ["南城街道", "东城街道", "莞城街道", "万江街道", "松山湖高新区", "长安镇", "虎门镇"],
      },
    ],
  },
  {
    province: "浙江省",
    cities: [
      {
        city: "杭州市",
        code: "330101",
        districts: ["上城区", "拱墅区", "西湖区", "滨江区", "萧山区", "余杭区", "临平区", "钱塘区"],
      },
      {
        city: "宁波市",
        code: "330201",
        districts: ["海曙区", "江北区", "镇海区", "北仑区", "鄞州区", "奉化区"],
      },
      {
        city: "温州市",
        code: "330301",
        districts: ["鹿城区", "龙湾区", "瓯海区", "洞头区", "瑞安市", "乐清市"],
      },
      {
        city: "嘉兴市",
        code: "330401",
        districts: ["南湖区", "秀洲区", "海宁市", "平湖市", "桐乡市"],
      },
    ],
  },
  {
    province: "江苏省",
    cities: [
      {
        city: "南京市",
        code: "320101",
        districts: ["玄武区", "秦淮区", "建邺区", "鼓楼区", "浦口区", "栖霞区", "雨花台区", "江宁区"],
      },
      {
        city: "苏州市",
        code: "320501",
        districts: ["姑苏区", "虎丘区", "吴中区", "相城区", "吴江区", "工业园区", "昆山市", "常熟市"],
      },
      {
        city: "无锡市",
        code: "320201",
        districts: ["梁溪区", "锡山区", "惠山区", "滨湖区", "新吴区", "江阴市", "宜兴市"],
      },
    ],
  },
  {
    province: "四川省",
    cities: [
      {
        city: "成都市",
        code: "510101",
        districts: ["锦江区", "青羊区", "金牛区", "武侯区", "成华区", "龙泉驿区", "双流区", "郫都区", "高新南区", "天府新区"],
      },
      {
        city: "绵阳市",
        code: "510701",
        districts: ["涪城区", "游仙区", "安州区", "江油市"],
      },
    ],
  },
  {
    province: "湖北省",
    cities: [
      {
        city: "武汉市",
        code: "420101",
        districts: ["江岸区", "江汉区", "硚口区", "汉阳区", "武昌区", "青山区", "洪山区", "东西湖区", "江夏区", "东湖高新区"],
      },
    ],
  },
  {
    province: "湖南省",
    cities: [
      {
        city: "长沙市",
        code: "430101",
        districts: ["芙蓉区", "天心区", "岳麓区", "开福区", "雨花区", "望城区", "长沙县"],
      },
    ],
  },
  {
    province: "陕西省",
    cities: [
      {
        city: "西安市",
        code: "610101",
        districts: ["新城区", "碑林区", "莲湖区", "雁塔区", "灞桥区", "未央区", "阎良区", "长安区", "高新区"],
      },
    ],
  },
  {
    province: "山东省",
    cities: [
      {
        city: "济南市",
        code: "370101",
        districts: ["历下区", "市中区", "槐荫区", "天桥区", "历城区", "长清区", "高新区"],
      },
      {
        city: "青岛市",
        code: "370201",
        districts: ["市南区", "市北区", "黄岛区", "崂山区", "李沧区", "城阳区", "即墨区"],
      },
    ],
  },
  {
    province: "福建省",
    cities: [
      {
        city: "福州市",
        code: "350101",
        districts: ["鼓楼区", "台江区", "仓山区", "晋安区", "马尾区", "长乐区"],
      },
      {
        city: "厦门市",
        code: "350201",
        districts: ["思明区", "湖里区", "集美区", "海沧区", "同安区", "翔安区"],
      },
    ],
  },
  {
    province: "河南省",
    cities: [
      {
        city: "郑州市",
        code: "410101",
        districts: ["中原区", "二七区", "管城回族区", "金水区", "上街区", "惠济区", "郑东新区", "高新区"],
      },
    ],
  },
  {
    province: "安徽省",
    cities: [
      {
        city: "合肥市",
        code: "340101",
        districts: ["瑶海区", "庐阳区", "蜀山区", "包河区", "长丰县", "肥东县", "肥西县", "高新区"],
      },
    ],
  },
  {
    province: "辽宁省",
    cities: [
      {
        city: "沈阳市",
        code: "210101",
        districts: ["和平区", "沈河区", "大东区", "皇姑区", "铁西区", "苏家屯区", "浑南区"],
      },
      {
        city: "大连市",
        code: "210201",
        districts: ["中山区", "西岗区", "沙河口区", "甘井子区", "旅顺口区", "金州区", "高新园区"],
      },
    ],
  },
];

const STREET_NAMES = [
  "中山路", "建设路", "人民路", "解放路", "科技大道", "和平路", "中关村大街", "创业路",
  "文三路", "天府大道", "深南大道", "滨江路", "南京路", "世纪大道", "朝阳路", "长春街",
  "延安路", "光明路", "振兴街", "新华路", "体育场路", "环城西路", "金鸡湖大道", "科苑南路"
];

/**
 * 生成真实三级省市严格对应的详细中国地址
 */
export function generateRealisticAddress(): {
  fullAddress: string;
  province: string;
  city: string;
  district: string;
  areaCode: string;
} {
  const prov = CHINA_ADMIN_DIVISIONS[Math.floor(Math.random() * CHINA_ADMIN_DIVISIONS.length)];
  const cityObj = prov.cities[Math.floor(Math.random() * prov.cities.length)];
  const district = cityObj.districts[Math.floor(Math.random() * cityObj.districts.length)];
  const street = STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)];
  const num = Math.floor(1 + Math.random() * 888);
  const building = Math.floor(1 + Math.random() * 28);
  const unit = Math.floor(1 + Math.random() * 4);
  const room = Math.floor(101 + Math.random() * 1900);

  // 直辖市避免输出重复的“北京市北京市”
  const prefix = prov.province === cityObj.city ? prov.province : `${prov.province}${cityObj.city}`;
  const fullAddress = `${prefix}${district}${street}${num}号${building}号楼${unit}单元${room}室`;

  return {
    fullAddress,
    province: prov.province,
    city: cityObj.city,
    district,
    areaCode: cityObj.code,
  };
}

/**
 * 生成与真实行政区划对应合规的 18 位中国二代测试身份证号码
 */
export function generateTestIdCard(): string {
  const addr = generateRealisticAddress();
  const area = addr.areaCode;
  const year = 1970 + Math.floor(Math.random() * 35);
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");
  const seq = String(100 + Math.floor(Math.random() * 899));

  const prefix17 = `${area}${year}${month}${day}${seq}`;

  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(prefix17[i], 10) * weights[i];
  }
  const checkDigit = checkCodes[sum % 11];

  return `${prefix17}${checkDigit}`;
}

/**
 * 基于成熟库与真实地域关系生成字段测试值
 */
export function generateSingleFieldValue(type: MockFieldType): string {
  switch (type) {
    case "name":
      return fakerZH_CN.person.fullName();

    case "phone": {
      const prefixes = ["138", "139", "135", "136", "150", "158", "188", "189", "177", "199", "186"];
      const p = prefixes[Math.floor(Math.random() * prefixes.length)];
      const tail = String(Math.floor(10000000 + Math.random() * 90000000));
      return `${p}${tail}`;
    }

    case "email":
      return fakerZH_CN.internet.email();

    case "idcard":
      return generateTestIdCard();

    case "address":
      return generateRealisticAddress().fullAddress;

    case "company":
      return fakerZH_CN.company.name();

    case "bank_card":
      return `622202${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    case "ip":
      return fakerZH_CN.internet.ipv4();

    case "datetime": {
      const d = fakerZH_CN.date.recent({ days: 365 });
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    case "job":
      return fakerZH_CN.person.jobTitle();

    case "uuid":
      return fakerZH_CN.string.uuid();

    default:
      return "测试数据";
  }
}

/**
 * 批量生成结构化 Mock 数据
 */
export function generateMockRecords(
  fields: MockFieldConfig[],
  quantity: number = 10
): Record<string, any>[] {
  const count = Math.min(Math.max(quantity, 1), 100);
  const records: Record<string, any>[] = [];

  for (let i = 0; i < count; i++) {
    const row: Record<string, any> = { id: i + 1 };
    fields.forEach((f) => {
      row[f.key] = generateSingleFieldValue(f.type);
    });
    records.push(row);
  }

  return records;
}

/**
 * 转换 Mock 数据为目标导出格式
 */
export function formatMockDataOutput(
  records: Record<string, any>[],
  formatType: "json" | "csv" | "sql",
  tableName: string = "mock_users"
): string {
  if (records.length === 0) return "";

  if (formatType === "json") {
    return JSON.stringify(records, null, 2);
  }

  if (formatType === "csv") {
    const headers = Object.keys(records[0]);
    const csvRows = [headers.map((h) => `"${h}"`).join(",")];
    records.forEach((row) => {
      const values = headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`);
      csvRows.push(values.join(","));
    });
    return csvRows.join("\n");
  }

  if (formatType === "sql") {
    const headers = Object.keys(records[0]);
    const sqlStatements = records.map((row) => {
      const values = headers.map((h) => `'${String(row[h]).replace(/'/g, "''")}'`);
      return `INSERT INTO ${tableName} (${headers.join(", ")}) VALUES (${values.join(", ")});`;
    });
    return sqlStatements.join("\n");
  }

  return "";
}
