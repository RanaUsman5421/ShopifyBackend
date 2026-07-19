import dotenv from "dotenv";
import axios from "axios";
import mongoose from "mongoose";
import { BuyerAndSeller } from "../models/buyerAndSeller.model.js";
import { CodInvoice } from "../models/codInvoice.modal.js";
import ShipperBallance from "../models/ShipperPaymentsBallance.js";
import ShipperTemplates from "../models/ShipperTamplates.modal.js";
import DCInvoice, { DCCounter } from '../models/Invoice.modal.js';
import { fetchLeopardsCities, fetchMnPCities, fetchTrexCities, fetchDaakCities } from "../utils/courierCity.js";
import shipperModal from "../models/shipper.modal.js";
import shopifyOrdersModal from '../models/shopifyOrders.modal.js';
import Store from "../models/Store.js";
import leopardsOrdersmodal from '../models/leopardsOrdersmodal.js';

// Load environment variables
dotenv.config();

const cityToZone = {
Lahore: 'Zone A',
Hyderabad: 'Zone B',
Karachi: 'Zone B',
Quetta: 'Zone B',
Sukkur: 'Zone B',
'Hyderabad Allied': 'Zone B',
Faisalabad: 'Zone A', // changed to Zone A
Kasur: 'Zone A', // changed to Zone A
Sargodha: 'Zone A', // changed to Zone A
Sheikhupura: 'Zone A', // changed to Zone A
Sialkot: 'Zone A', // changed to Zone A
Chakwal: 'Zone A', // changed to Zone A
'Kallar Syedan': 'Zone A', // changed to Zone A
Gujranwala: 'Zone A', // changed to Zone A
Islamabad: 'Zone A',
Jhelum: 'Zone A', // changed to Zone A
'Mirpur Azad Kashmir': 'Zone B',
Muzaffarabad: 'Zone B',
Rawalpindi: 'Zone A', // changed to Zone A
Taxila: 'Zone A', // changed to Zone A
'Wah Cant': 'Zone A', // changed to Zone A
Nowshera: 'Zone B',
Peshawar: 'Zone B',
'Peshawar Allied': 'Zone B',
Bahawalpur: 'Zone A', // changed to Zone A
Multan: 'Zone A', // changed to Zone A
'Rahim Yar Khan': 'Zone A', // changed to Zone A
Sahiwal: 'Zone A', // changed to Zone A
'18-HAZARI': 'Zone C', // zone C start here
CHICHAWATNI: 'Zone C',
'78 MORE': 'Zone C',
ABBOTTABAD: 'Zone C',
'ABDUL HAKEEM': 'Zone C',
'ADDA 37 PHATAK- MACHIWAL': 'Zone C',
'ADDA 73/5-L': 'Zone C',
'ADDA BASHEER ABAD TEHSIL GOJRA DISTT TOBATEK SING': 'Zone C',
'ADDA BOTIPAL': 'Zone C',
'ADDA CHAKRALA': 'Zone C',
'ADDA CHAWANT- PAK PATAN SHARIF': 'Zone C',
'ADDA FITNA': 'Zone C',
'ADDA GHULAM HUSSAIN': 'Zone C',
'ADDA GOJRA': 'Zone C',
'ADDA JOHAL - KHURIAN WALA': 'Zone C',
'ADDA LAR': 'Zone C',
'ADDA MUREED SHAKH': 'Zone C',
'ADDA NAIWALA BANGLA': 'Zone C',
'ADDA PAKHI MORE': 'Zone C',
'ADDA PANWAN DISTT SRA': 'Zone C',
'ADDA PIPLI': 'Zone C',
'ADDA PLOT': 'Zone C',
'ADDA R A WAIN': 'Zone C',
'ADDA RATTA TIBBA': 'Zone C',
'ADDA SHAHI WALA': 'Zone C',
'ADDA SHAIKHEN - JHANG': 'Zone C',
'ADDA SHEIKHAN TEHSIL LALIAN': 'Zone C',
'ADDA SOUNDH': 'Zone C',
'ADDA ZAKHEERA': 'Zone C',
'ADIL PUR': 'Zone C',
'AHMED PUR EAST': 'Zone A', // changed to Zone A
'AHMED PUR SIAL': 'Zone C',
'AHMED YAR THANA': 'Zone C',
'AIRPORT HOUSING SOCIETY ISLAMABAD': 'Zone C',
AKARIANWALA: 'Zone C',
'AKHOR WAL': 'Zone C',
'AKORA KHATTAK': 'Zone C',
'AKRI CHOWDAGI': 'Zone C',
'AKTARA ABAD': 'Zone C',
'ALI ABAD': 'Zone C',
'ALI MURAD JAMALI': 'Zone C',
'ALI PUR CHATTHA': 'Zone A', // changed to Zone A
'ALI PUR CHOWK': 'Zone C',
'ALI PUR KANJU - AMAN GARH': 'Zone C',
'ALI PUR SAYYADAN': 'Zone C',
ALIPUR: 'Zone A', // changed to Zone A
'ALIPUR BYPASS - MUZAFFARGARH': 'Zone C',
'ALLAH ABAD': 'Zone C',
'AMAN GHAR - NOWSHERA': 'Zone C',
'AMAN KOT': 'Zone C',
'AMEER PUR SADAT - AMAN GARH': 'Zone C',
'AMEER PUR STATION - AMAN GARH': 'Zone C',
'AMINPUR BANGLOW': 'Zone C',
ARIFWALA: 'Zone A', // changed to Zone A
AROOP: 'Zone C',
ASBANR: 'Zone C',
ATTOCK: 'Zone A', // changed to Zone A
AWAGAT: 'Zone C',
AWARAN: 'Zone C',
BABUZAI: 'Zone C',
BADIN: 'Zone C',
BADRAGA: 'Zone C',
BADWAN: 'Zone C',
'BAGAR JEE': 'Zone C',
BAGH: 'Zone C',
BAGTANWALA: 'Zone C',
'BAGYANA KALAM': 'Zone C',
BAHAWALNAGAR: 'Zone A', // changed to Zone A
BAHNOTE: 'Zone C',
BAJAUR: 'Zone C',
BAJWAR: 'Zone C',
'BAKHAR JAMALI': 'Zone C',
BAKRANI: 'Zone C',
'BALACH - CHITRAL': 'Zone C',
BALAKOT: 'Zone C',
'BALAM BUTT': 'Zone C',
BELA: 'Zone C',
BALENEGORE: 'Zone C',
'BALI DINO KAKA': 'Zone C',
BALKASSAR: 'Zone C',
'BANGLA MANTHAR': 'Zone C',
'BANGLOW GOGERA': 'Zone C',
'BANI GALA': 'Zone C',
BANNU: 'Zone C',
'BANNU B.I.S.E.': 'Zone C',
'BARA BANDA - RISALPUR': 'Zone C',
'BARA KAHU': 'Zone C',
BARIKOT: 'Zone C',
'BARNALA - AK': 'Zone C',
'BARNALA - FSD': 'Zone C',
BARKI: 'Zone C',
BASAL: 'Zone C',
'BASIR PUR': 'Zone C',
BATGARAM: 'Zone C',
BATKHELA: 'Zone C',
BATORA: 'Zone C',
BATRASI: 'Zone C',
BEHAL: 'Zone C',
'BEHARI - DADYAL (A.K)': 'Zone C',
BEHLANI: 'Zone C',
GAWADAR: 'Zone C',
BESHAM: 'Zone C',
BHAKKAR: 'Zone A', // changed to Zone A
'BHAI PHAIRU ( PHOOL NAGAR )': 'Zone C',
BHALWAL: 'Zone A', // changed to Zone A
'BHAN SAEEDABAD': 'Zone C',
BHAWANA: 'Zone C',
BHAUN: 'Zone C',
BHERA: 'Zone C',
BHIMBER: 'Zone C',
'BHIKHI (MAIN ROAD)': 'Zone C',
'BHIRIA CITY': 'Zone C',
BHITSHAH: 'Zone C',
'BHONG RAHIM ABAD': 'Zone C',
BHUNG: 'Zone C',
BINDI: 'Zone C',
BUCHEKI: 'Zone C',
'BUDHLA SANT': 'Zone C',
BUNAIR: 'Zone C',
'BUNGA HAYYAT': 'Zone C',
BUREWALA: 'Zone A', // changed to Zone A
'BUXA PUR': 'Zone C',
'CADET COLLEGE LARKANA': 'Zone C',
CHACHRO: 'Zone C',
CHAGORI: 'Zone C',
'CHAJWAL - TANDLIANWALA': 'Zone C',
CHAK: 'Zone C',
'CHAK JHUMRA': 'Zone C',
'CHAK MIRDAD MUAFI': 'Zone C',
'CHAK SAWARI': 'Zone C',
CHAKDARA: 'Zone C',
CHAKIAN: 'Zone C',
CHAKLALA: 'Zone C',
CHAKWAL: 'Zone A', // changed to Zone A
'CHAKWAL KHANPUR': 'Zone C',
CHAMAN: 'Zone C',
CHAMBAR: 'Zone C',
'CHAND DA QILA': 'Zone C',
'CHANGA MANGA': 'Zone C',
CHANKI: 'Zone C',
CHAROHI: 'Zone C',
CHARSADDA: 'Zone C',
CHAWINDA: 'Zone C',
CHASHMA: 'Zone C',
'CHASHMA GOTH': 'Zone C',
CHECHIAN: 'Zone C',
CHILLAS: 'Zone C',
CHINIOT: 'Zone A', // changed to Zone A
CHISHTIAN: 'Zone A', // changed to Zone A
CHITRAL: 'Zone C',
CHMAN: 'Zone C',
'CHOA SYDEN SHAH': 'Zone C',
'CHOWK AZAM': 'Zone C',
'CHOWK MUNDA DISTRICT MUZAFFARGARH': 'Zone C',
'CHOWK SARWAR SHAHEED': 'Zone C',
CHOWKI: 'Zone C',
CHUNIAN: 'Zone A', // changed to Zone A
DADU: 'Zone C',
DADYAL: 'Zone C',
'DAGGAR BAZAR - BUNAIR': 'Zone C',
DAHARKI: 'Zone C',
DAJAL: 'Zone C',
DAIWAL: 'Zone C',
DAKOTA: 'Zone C',
DALBANDIN: 'Zone C',
DAKKHAN: 'Zone C',
'DALA ZAK ROAD': 'Zone C',
'DANIN - CHITRAL': 'Zone C',
'DARA ADAM KHEL': 'Zone C',
DARGAI: 'Zone C',
DASKA: 'Zone A', // changed to Zone A
'DARYAL GAJJAN': 'Zone C',
'DAUD KHEL': 'Zone C',
DAULATPUR: 'Zone C',
DAULTALA: 'Zone C',
'DEPAL PUR': 'Zone C',
'DERA ALLAHYAR': 'Zone C',
'DERA GHAZI KHAN': 'Zone A', // changed to Zone A
'DERA ISMAIL KHAN': 'Zone C',
'DERA MURAD JAMALI': 'Zone C',
'DHANGRI BALA': 'Zone C',
DHANOT: 'Zone C',
DHARANWALA: 'Zone C',
DHODA: 'Zone C',
DHORIA: 'Zone C',
DHUDIAL: 'Zone C',
DIGRI: 'Zone C',
DIJKOT: 'Zone C',
DHUNNI: 'Zone C',
'DIN GARH': 'Zone C',
DINA: 'Zone A', // changed to Zone A
'DIN M JENEJO': 'Zone C',
DINGA: 'Zone A', // changed to Zone A
DOKRI: 'Zone C',
DOMEL: 'Zone C',
'DOLAT NAGAR': 'Zone C',
DOUR: 'Zone C',
'DRAKHAN MAJEDI': 'Zone C',
DUKKI: 'Zone C',
DUNYAPUR: 'Zone A', // changed to Zone A
HUB: 'Zone C',
'ELLAH ABAD': 'Zone C',
'EMANABAD TOWN': 'Zone C',
'DULLE WALA': 'Zone C',
'EMIN ABAD MORE': 'Zone C',
DUNZNAP: 'Zone C',
'ESA KHEL': 'Zone C',
'FAQIR WALI': 'Zone C',
'FAROOQA (DISTT. SGD)': 'Zone C',
FAROOQABAD: 'Zone A', // changed to Zone A
'FATEH JANG': 'Zone A', // changed to Zone A
'FATEH PUR KAMAL': 'Zone C',
'FATEHPUR - FPR': 'Zone C',
'FEROZ WATOWAN': 'Zone C',
FEROZA: 'Zone C',
'FFC DISTT GHOTKI': 'Zone C',
'FORT ABBAS': 'Zone A', // changed to Zone A
'GADOON AMAZAI': 'Zone C',
'GAGGO MANDI': 'Zone C',
GAMBAT: 'Zone C',
'GAMBA SKARDU *': 'Zone C',
GAMBER: 'Zone C',
GANORAI: 'Zone C',
'GARH MOR': 'Zone C',
'GARHI YASIN': 'Zone C',
'GARHI SABHAYO': 'Zone C',
'GARI HABIBULLAH': 'Zone C',
'GARI KHAIRO': 'Zone C',
'GARI MORI': 'Zone C',
GARJAKH: 'Zone C',
GARYALA: 'Zone C',
GHAKKAR: 'Zone C',
GERRELO: 'Zone C',
'GHARI KAPURA': 'Zone C',
'GHARIAL CAMP': 'Zone C',
GHARO: 'Zone C',
GHAZI: 'Zone C',
'GHAZI ABAD': 'Zone C',
'GHAZI BROTHA': 'Zone C',
'GHAZI MINARA': 'Zone C',
'GHOR GHUSHTI': 'Zone C',
GHOTKI: 'Zone C',
'GHOUS PUR': 'Zone C',
'GHUAHRA GALI': 'Zone C',
GHUNIKE: 'Zone C',
GILGIT: 'Zone C',
'GILA WALA': 'Zone C',
'GODH PUR': 'Zone C',
GOJRA: 'Zone A', // changed to Zone A
'GOJRA - FSD': 'Zone C',
'GOLDOOR - CHITRAL': 'Zone C',
GUDDU: 'Zone C',
'GUJJAR KHAN': 'Zone A', // changed to Zone A
GUJRANWALA: 'Zone A', // changed to Zone A
'GUL ABAD': 'Zone C',
'GUL PUR': 'Zone C',
'GULAB PURA': 'Zone C',
'HABIBA ABAD': 'Zone C',
'HAFIZ ABAD': 'Zone A', // changed to Zone A
'HAIBAT SHAHEED': 'Zone C',
HAIDRA: 'Zone C',
'HAIDRI BEVERAGES': 'Zone C',
HAJIRA: 'Zone C',
HALA: 'Zone C',
HALANI: 'Zone C',
HANGU: 'Zone C',
HARIPUR: 'Zone C',
HARNAI: 'Zone C',
HARNOULI: 'Zone C',
HAROONABAD: 'Zone A', // changed to Zone A
HASILPUR: 'Zone A', // changed to Zone A
'HARRAPA STATION / CITY': 'Zone C',
'HASSAN ABDAL': 'Zone A', // changed to Zone A
'HASILPUR ( UBL - 896 GHANI PUR BRANCH)': 'Zone C',
HATTAR: 'Zone C',
'HAVELI LAKHA': 'Zone A', // changed to Zone A
'HAVELIAN (CITY)': 'Zone C',
HAZRO: 'Zone A', // changed to Zone A
HINGORJA: 'Zone C',
HINGORNO: 'Zone C',
'HUJRA SHAH MUQEEM': 'Zone A', // changed to Zone A
HUMMAK: 'Zone C',
HUNZA: 'Zone C',
'HYDER ABAD THAL': 'Zone C',
'IQBAL NAGAR': 'Zone C',
IQBALABAD: 'Zone C',
ISKANDARABAD: 'Zone C',
'ISLAM PUR': 'Zone C',
JABBI: 'Zone C',
JACOBABAD: 'Zone C',
'JALALPUR JATTAN': 'Zone A', // changed to Zone A
'JALALPUR PIRWALA': 'Zone A', // changed to Zone A
'JAMALDIN WALI': 'Zone C',
JAMPUR: 'Zone A', // changed to Zone A
JAMSHORO: 'Zone C',
JAND: 'Zone A', // changed to Zone A
'JARANWALA ROAD - KHURRIANWALA': 'Zone C',
JATOI: 'Zone A', // changed to Zone A
JAWARIAN: 'Zone C',
JEHANGIRA: 'Zone C',
JEHLUM: 'Zone A', // changed to Zone A
'JEHANGIRA PAR - JEHANGIRA': 'Zone C',
'JHABRAN MANDI': 'Zone C',
JHANG: 'Zone A', // changed to Zone A
JHANIAN: 'Zone A', // changed to Zone A
'JHAT PAT': 'Zone C',
JHOL: 'Zone C',
JINNAHABAD: 'Zone C',
JOHARABAD: 'Zone C',
JOHI: 'Zone C',
KABAL: 'Zone C',
'KABIR WALA': 'Zone A', // changed to Zone A
'KACHA KHO': 'Zone C',
KACHELO: 'Zone C',
KAHOTA: 'Zone A', // changed to Zone A
'KALA SHAH KAKU': 'Zone C',
KALABAGH: 'Zone C',
'KALAR SYEDAN': 'Zone A', // changed to Zone A
KALAT: 'Zone C',
'KALLAR KAHAR': 'Zone A', // changed to Zone A
'KALOOR KOT': 'Zone A', // changed to Zone A
KAMALIA: 'Zone A', // changed to Zone A
'KAMBAR ALI KHAN': 'Zone C',
'KAMER MISHANI': 'Zone C',
KAMOKE: 'Zone A', // changed to Zone A
KAMRA: 'Zone C',
KANDHKOT: 'Zone C',
KANDHRA: 'Zone C',
KANDIARI: 'Zone C',
KANDYARO: 'Zone C',
KANGANPUR: 'Zone A', // changed to Zone A
MANORA: 'Zone C',
KARAK: 'Zone C',
'KARAM ABAD': 'Zone C',
'KARAM PUR': 'Zone C',
'KARM KHAN NIZAMANI': 'Zone C',
'KAROR LALESAN': 'Zone A', // changed to Zone A
'KAROR PACCA': 'Zone A', // changed to Zone A
KARONDI: 'Zone C',
KASHMORE: 'Zone C',
KASOWAL: 'Zone C',
KASUR: 'Zone A', // changed to Zone A
'KATHA SAGRAL': 'Zone C',
KATLANG: 'Zone C',
'KATI GARHI': 'Zone C',
KEHAL: 'Zone C',
'KGANI WALA': 'Zone C',
KHAARAN: 'Zone C',
KHADAGZAI: 'Zone C',
'KHAIR PUR': 'Zone C',
'KHAIR PUR MIRS': 'Zone C',
'KHAIRPUR NATHAN SHAH': 'Zone C',
'KHAIRPUR TAIMWALI': 'Zone A', // changed to Zone A
KHALABAT: 'Zone C',
KHAMBI: 'Zone C',
KHALOO: 'Zone C',
'KHAN BELA': 'Zone A', // changed to Zone A
'KHAN GARH': 'Zone C',
'KHAN GARH SHARIF': 'Zone C',
'KHAN PUR MAHAR': 'Zone C',
'KHAN PUR MARAL': 'Zone C',
'KHAN WAHAN': 'Zone C',
'KHAN ZANGHI': 'Zone C',
KHANABAD: 'Zone C',
KHANEWAL: 'Zone A', // changed to Zone A
'KHANPUR CHAKWAL': 'Zone C',
'KHANPUR BAGA SHER': 'Zone C',
'KHANPUR MAHAR GHOTKI': 'Zone C',
'KHANPUR SHOMALI': 'Zone C',
'KHANQAN DOGRAN': 'Zone C',
'KHANQA SHARIF': 'Zone C',
KHAPLU: 'Zone C',
KHARIAN: 'Zone A', // changed to Zone A
'KHARIAN CANTT': 'Zone C',
'KHARA ROAD': 'Zone C',
'KHAROTTA SAIDAN': 'Zone C',
'KHAWAJA GUNJ': 'Zone C',
KHAZAKHELA: 'Zone C',
'KHEWRA DANDOT': 'Zone C',
KHIPRO: 'Zone C',
'KHONGI PAIYAN': 'Zone C',
KHURRIANWALA: 'Zone A', // changed to Zone A
KHUZDAR: 'Zone C',
KOHAT: 'Zone C',
KOHLU: 'Zone C',
'KOK PUL - HMK': 'Zone C',
'KOT ABDUL MALIK': 'Zone C',
'KOT ADDU': 'Zone A', // changed to Zone A
'KOT AKBER': 'Zone C',
'KOT BANGLOW': 'Zone C',
'KOT BAWANI DAS': 'Zone C',
'KOT CHUTTA': 'Zone C',
'KOT DIGI': 'Zone C',
'KOT GHULAM MUHAMMAD': 'Zone C',
'KOT HALEEM KHAN': 'Zone C',
'KOT CHANDNA': 'Zone C',
'KOT LADHA': 'Zone C',
'KOT MOMIN': 'Zone A', // changed to Zone A
'KOT MURAD KHAN': 'Zone C',
'KOT NAJEEB ULLAH': 'Zone C',
'KOT MIRAS': 'Zone C',
'KOT RADHA KISHAN': 'Zone A', // changed to Zone A
'KOT RANJEET': 'Zone C',
'KOT REHAR': 'Zone C',
'KOT RUKAN DIN': 'Zone C',
'KOT SAJAN SING': 'Zone C',
'KOT SHAH': 'Zone C',
'KOT SHAH MUHAMMAD - GUJRANWALA': 'Zone C',
KOTLA: 'Zone C',
'KOTI MORE': 'Zone C',
'KOTLA JAM': 'Zone C',
'KOTLA MOHSIN KHAN': 'Zone C',
'KOTLI LOHARAN': 'Zone C',
KOTLY: 'Zone C',
'KOTLY PIR AHMED SHAH': 'Zone C',
KOTRI: 'Zone C',
'KOTRI KABIR BRANCH': 'Zone C',
KUCHLAK: 'Zone C',
'KUND - JEHANGIRA': 'Zone C',
KUNDIAN: 'Zone C',
'KUNJA MANGOWAL': 'Zone C',
KUNRI: 'Zone C',
KUSHAB: 'Zone C',
'LAHORE (DAVIS)': 'Zone C',
'LAKHI GHULAM SHAH': 'Zone C',
'LAKKI MARWAT': 'Zone C',
'LALA MUSA': 'Zone A', // changed to Zone A
'LALA RUKH': 'Zone C',
LALIAN: 'Zone C',
LANDIKOTAL: 'Zone C',
LARKANA: 'Zone C',
'LARY ADDA': 'Zone C',
LAYYAH: 'Zone A', // changed to Zone A
'LIAQUAT PUR': 'Zone A', // changed to Zone A
'LILYANI-KOT MOMAN': 'Zone C',
LODHRAN: 'Zone A', // changed to Zone A
'LOHI BHER - RAWALPINDI': 'Zone C',
LORALAI: 'Zone C',
'MACHI GOTH': 'Zone C',
'MACHI WAL': 'Zone C',
MAILSI: 'Zone A', // changed to Zone A
'MAKHDOOM PUR': 'Zone C',
'MAKHDOOM RASHEED': 'Zone C',
MAKLI: 'Zone C',
'MALAK WAL': 'Zone C',
MALAKAND: 'Zone C',
'MAMUN KANJAN': 'Zone C',
MANAWALA: 'Zone C',
'MANAWALA DISTT. FSD ( 203 R/B )': 'Zone C',
PANJGOOR: 'Zone C',
'MANDI BHAUDDIN': 'Zone A', // changed to Zone A
'MANDI FAIZ ABAD': 'Zone C',
'MANDI SHAH JEWNA': 'Zone C',
'MANDI SUKHEKE': 'Zone C',
'MANDI USMANWALA': 'Zone C',
MANDIAN: 'Zone C',
'MANGA MANDI (MULTAN ROAD ONLY)': 'Zone C',
MANDRA: 'Zone C',
MANGOWAL: 'Zone C',
MANKERA: 'Zone C',
'MANKI - JEHANGIRA': 'Zone C',
'MANKI SHARIEF': 'Zone C',
MANSEHRA: 'Zone C',
MARDAN: 'Zone C',
MASTUNG: 'Zone C',
MATIARI: 'Zone C',
MATLI: 'Zone C',
MEHAR: 'Zone C',
MEHRABPUR: 'Zone C',
'MIAN CHANNU': 'Zone A', // changed to Zone A
MIANI: 'Zone C',
MIANWALI: 'Zone A', // changed to Zone A
'MIR PUR A.K': 'Zone C',
'MIR PUR BURARO': 'Zone C',
'MIR PUR MATELO': 'Zone C',
'MIRPUR KHAS': 'Zone C',
'MIRPUR SAKRO': 'Zone C',
'MIRWAH GORCHANI': 'Zone C',
'MITHA TIWANA CITY': 'Zone C',
MITHI: 'Zone C',
MITRO: 'Zone C',
'MOOSA KHEL - MIANWALI': 'Zone C',
'MORE KHUNDA': 'Zone C',
MORO: 'Zone C',
MUCH: 'Zone C',
MUNDIKE: 'Zone C',
MURADABAD: 'Zone C',
MUREEDKAY: 'Zone C',
'MURID WALA': 'Zone C',
MURREE: 'Zone C',
'MUSAFIR KHANA': 'Zone C',
'MUSLIM BAGH': 'Zone C',
'MUSLIMABAD-ABBOTTABAD': 'Zone C',
'MUZAFFARABAD A K': 'Zone C',
MUZAFFARGARH: 'Zone A', // changed to Zone A
'NANKANA SAHAB': 'Zone A', // changed to Zone A
'NARANG MANDI': 'Zone A', // changed to Zone A
NAROWAL: 'Zone A', // changed to Zone A
'NARWALA BANGLA': 'Zone C',
NASIRABAD: 'Zone C',
'NASIR PUR': 'Zone C',
NAUDERO: 'Zone C',
NAUKOT: 'Zone C',
NAUSHERA: 'Zone C',
NAWABSHAH: 'Zone C',
'NAWAN JANDANWALA': 'Zone C',
'NAYA LAHORE': 'Zone C',
'NEW DUMBALO': 'Zone C',
'NEW JATOI': 'Zone C',
'NEW SAEEDABAD': 'Zone C',
'NEW SAHIWAL CITY': 'Zone C',
'NIZAM PUR': 'Zone C',
NIZAMABAD: 'Zone C',
'NOOR KOT': 'Zone C',
'NOOR JAMAL': 'Zone C',
'NOOR PUR NOURANGA': 'Zone C',
NOORIABAD: 'Zone C',
'NOOR SHAH': 'Zone C',
'NOSHERO FEROZ': 'Zone C',
NOSHKI: 'Zone C',
NOORPUR: 'Zone C',
NOWSHERA: 'Zone C',
'NOWSHERA VIRKAN': 'Zone C',
'NURPUR THAL': 'Zone C',
'NOWSHERA ROAD': 'Zone C',
OGHI: 'Zone C',
OKARA: 'Zone A', // changed to Zone A
'OKARA CANTT': 'Zone C',
PASNI: 'Zone C',
PABBI: 'Zone C',
'PAC KAMRA': 'Zone C',
'PACCA CHANG': 'Zone C',
PADHRAR: 'Zone C',
'PAF BASE, QUETTA': 'Zone C',
'PAF LOWER TOPA - MURREE': 'Zone C',
'PAHAR PUR': 'Zone C',
PAINSRA: 'Zone C',
'PAK PATTAN SHARIF': 'Zone A', // changed to Zone A
PANDIK: 'Zone C',
PANJERA: 'Zone C',
'PANJ MORO': 'Zone C',
'PANU AQIL': 'Zone C',
'PANU AQIL CANTT': 'Zone C',
'PANYOLA - RAWALAKOT': 'Zone C',
PARHOTI: 'Zone C',
'PASNI AIRPORT': 'Zone C',
PASROOR: 'Zone A', // changed to Zone A
PATTAK: 'Zone C',
PATTOKI: 'Zone A', // changed to Zone A
PEROWAL: 'Zone C',
PERUMAL: 'Zone C',
'PEZU - DERA ISMAIL KHAN': 'Zone C',
PHALIA: 'Zone A', // changed to Zone A
PHARIANWALI: 'Zone C',
PHULADYOON: 'Zone C',
PHULARWAN: 'Zone C',
'PIAL KALAN DSIT KASUR': 'Zone C',
'PIND DADAN KHAN': 'Zone A', // changed to Zone A
'PIND KALAN': 'Zone C',
'PIND KHURD': 'Zone C',
'PIND PARACHA': 'Zone C',
'PINDI BHATIAN': 'Zone C',
'PINDI GHEB': 'Zone A', // changed to Zone A
PIPLAN: 'Zone C',
PIPNAKH: 'Zone C',
'PIR JO GOTH': 'Zone C',
'PIR MAHAL': 'Zone A', // changed to Zone A
PIRYALO: 'Zone C',
PISHIN: 'Zone C',
PITHORO: 'Zone C',
'PNS MAKRAN': 'Zone C',
PULANDRI: 'Zone C',
'PULDAT KHAN': 'Zone C',
'PULL 111': 'Zone C',
'PULL MUNDA': 'Zone C',
'PUNJAR, KAHUTA': 'Zone C',
PUNWAN: 'Zone C',
'PURANA LLM': 'Zone C',
QABOOLA: 'Zone C',
'QADAR PUR': 'Zone C',
'QADIR ABAD': 'Zone C',
'QAIM PUR': 'Zone C',
QALANDARABAD: 'Zone C',
QAMBAR: 'Zone C',
'QASIM BELA': 'Zone C',
'QAZI AHMED': 'Zone C',
'QILA DEDAR SINGH': 'Zone C',
'QILA SAHIB SINGH': 'Zone C',
'QILLA SAIF ULLAH': 'Zone C',
QUAIDABAD: 'Zone C',
QULANDI: 'Zone C',
'RABWAH (CHANAB NAGAR)': 'Zone C',
RADHAN: 'Zone C',
'RADHAN STATION': 'Zone C',
'RAHAT ABAD': 'Zone C',
'RAHIM ABAD': 'Zone C',
RAHWALI: 'Zone C',
RAIWIND: 'Zone C',
'RAJ KOT': 'Zone C',
RAJANA: 'Zone C',
RAJANPUR: 'Zone A', // changed to Zone A
'RAJJAR - CHARSADDA': 'Zone C',
'RAM GARH': 'Zone C',
RAMAK: 'Zone C',
'RANG SHAH': 'Zone C',
RANGOO: 'Zone C',
'RANI PUR': 'Zone C',
'RATO DARO': 'Zone C',
'RATTA - DADYAL (A.K)': 'Zone C',
'RATTA BAJWA': 'Zone C',
RAWALAKOT: 'Zone C',
RAWAT: 'Zone C',
'REHMAN PURA - MUREEDKEY': 'Zone C',
'REHMAN PURA - SHEIKHUPURA': 'Zone C',
'RENALA KHURD': 'Zone A', // changed to Zone A
'RIKHI - MIANWALI': 'Zone C',
RISALPUR: 'Zone C',
ROHRI: 'Zone C',
RUSTAM: 'Zone C',
SADDOKI: 'Zone C',
SADIQABAD: 'Zone A', // changed to Zone A
SADUKI: 'Zone C',
'SAEED KHAN LAGHARI': 'Zone C',
'SAEED NAGAR': 'Zone C',
SAFDARABAD: 'Zone A', // changed to Zone A
'SAHARAN CHATTA': 'Zone C',
'SAHIWAL - SARGODHA': 'Zone C',
'SAIDU SHARIF': 'Zone C',
'SAJADA PHATAK': 'Zone C',
SAKHAKOT: 'Zone C',
SAKRAND: 'Zone C',
'SALEEM PURA': 'Zone C',
'SALEH KHANA - NOWSHERA': 'Zone C',
SALEHPAT: 'Zone C',
'SAMA SATTA': 'Zone C',
'SAMAN GOTH': 'Zone C',
SAMARO: 'Zone C',
SAMBRIAL: 'Zone A', // changed to Zone A
SAMUNDARI: 'Zone A', // changed to Zone A
SANAWAN: 'Zone C',
'SANDAL - DADYAL (A.K)': 'Zone C',
SANDHILIANWALI: 'Zone C',
SANGHAR: 'Zone C',
'SANGLA HILL': 'Zone A', // changed to Zone A
'SANJAR PUR': 'Zone C',
'SARA - E - MUHAJIR': 'Zone C',
'SARA -E- ALAMGIR': 'Zone C',
SARAI: 'Zone C',
SARIKORAN: 'Zone C',
SARSAWA: 'Zone C',
'SATIANA BANGLA': 'Zone C',
'SEHALA - HMK': 'Zone C',
SEHNSA: 'Zone C',
SEHWAN: 'Zone C',
SERAI: 'Zone C',
'SERAI NAURANG': 'Zone C',
'SERAISALEH - HARIPUR': 'Zone C',
SETHARJA: 'Zone C',
SHABQADAR: 'Zone C',
'SHADAD KOT': 'Zone C',
SHAGAI: 'Zone C',
'SHAH KOT': 'Zone C',
'SHAH MOHAMMAD': 'Zone C',
'SHAH MUHAMMAD DAHRI': 'Zone C',
'SHAHDAD PUR': 'Zone C',
'SHAHEEN ABAD': 'Zone C',
SHAHKAM: 'Zone C',
'SHAHPUR CHAKKAR': 'Zone C',
'SHAHPUR SADDAR': 'Zone C',
'SHAIDU - JEHANGIRA': 'Zone C',
'SHAKAR GARH': 'Zone A', // changed to Zone A
SHAMSABAD: 'Zone C',
SHAPATAN: 'Zone C',
SHARAQPUR: 'Zone A', // changed to Zone A
'SHEIKH MALTOON': 'Zone C',
SHEIKHUPURA: 'Zone A', // changed to Zone A
'SHERGARH - MARDAN': 'Zone C',
'SHEWA ADDA': 'Zone C',
'SHIKAR PUR': 'Zone C',
SHINKA: 'Zone C',
SHINKIARI: 'Zone C',
'SHONGI NO. 06 - KAMALIA': 'Zone C',
SHORKOT: 'Zone A', // changed to Zone A
SHUJAABAD: 'Zone A', // changed to Zone A
'SIAL MORR': 'Zone C',
SIBBI: 'Zone C',
SIHALA: 'Zone C',
'SIKANDAR PUR': 'Zone C',
SIKANDARABAD: 'Zone C',
SILANWALI: 'Zone C',
SINJHORO: 'Zone C',
'SITA ROAD': 'Zone C',
SKARDU: 'Zone C',
'SOBHO DERO': 'Zone C',
SOHAWA: 'Zone A', // changed to Zone A
SOKARI: 'Zone C',
'SUBHAN GOATH': 'Zone C',
'SUFAID DEHRI': 'Zone C',
'SUFAID SANG': 'Zone C',
SUI: 'Zone C',
'SUI WALA': 'Zone C',
SUJAWAL: 'Zone C',
'SUKHEKI MANDI': 'Zone A', // changed to Zone A
'SULTAN PUR - HAVELIAN': 'Zone C',
SUMANI: 'Zone C',
'SUNDAR ADDA': 'Zone C',
SWABI: 'Zone C',
SWAT: 'Zone C',
'TAKHAT BHAI': 'Zone C',
TALAGANG: 'Zone A', // changed to Zone A
TALASH: 'Zone C',
TALWANDI: 'Zone C',
'TALWARA MUGHLAN': 'Zone C',
TANDLIANWALA: 'Zone A', // changed to Zone A
'TANDO ADAM': 'Zone C',
'TANDO ALLAH YAR': 'Zone C',
'TANDO GHULAM ALI': 'Zone C',
'TANDO JAM': 'Zone C',
'TANDO MUHAMMAD KHAN': 'Zone C',
TANGWANI: 'Zone C',
TANK: 'Zone C',
TARBELA: 'Zone C',
TARNOL: 'Zone C',
'TARU JABA': 'Zone C',
'TATLAY AALI': 'Zone C',
'TATTA PANI': 'Zone C',
'Taunsa Sharif': 'Zone A', // changed to Zone A
TAXILA: 'Zone A', // changed to Zone A
'Toba Tek Sing': 'Zone C',
'TESSAR TOWN': 'Zone C',
THANA: 'Zone C',
'THAND KOI - GADOON AMAZAI': 'Zone C',
'THANG MORE (ILLAHABAD)': 'Zone C',
'THARI MIRWAH': 'Zone C',
'THARO SHAH': 'Zone C',
THATTA: 'Zone C',
'THEING JATTAN MORE': 'Zone C',
THEKRIAN: 'Zone C',
'THIKERI WALA': 'Zone C',
THINGI: 'Zone C',
'THOA KHALAS, KHAUTA': 'Zone C',
THOTHAL: 'Zone C',
'THROMANDI': 'Zone C',
THULL: 'Zone C',
'TIBBA MOHD NAGAR': 'Zone C',
'TIBBA SULTAN': 'Zone C',
TIMERGARAH: 'Zone C',
'TM RICE MILL DAVRY ROAD': 'Zone C',
'TOBA TEK SINGH': 'Zone A', // changed to Zone A
'TOHA BAHDUR': 'Zone C',
TOPI: 'Zone C',
'TORDER - JEHANGIRA': 'Zone C',
'TRANDA MUHAMMAD PANAH': 'Zone C',
'TUNG KALAN': 'Zone C',
UBARO: 'Zone C',
'UCH SHARIF': 'Zone A', // changed to Zone A
UCHHALI: 'Zone C',
UGGOKIE: 'Zone C',
UMERKOT: 'Zone C',
'UMRA ABAD': 'Zone C',
'UPPER TOPA': 'Zone C',
'UPPER DIR - UPD': 'Zone C',
'USTA MUHAMMAD': 'Zone C',
TURBAT: 'Zone C',
'VANIA MORE': 'Zone C',
'UTMAN ZAI - CHARSADDA': 'Zone C',
VEHARI: 'Zone A', // changed to Zone A
'VIJHIAAN WALA': 'Zone C',
'VERPAL CHATTA': 'Zone C',
'VIJIANWALA - POLICE CHOWKI CHUB': 'Zone C',
'VILLAGE AID': 'Zone C',
'VILLAGE ARRIAN RND RD': 'Zone C',
'VILLAGE INAYAT GOTH': 'Zone C',
'VILLAGE MIRAPUR': 'Zone C',
'VILLAGE RAJIB BHUTTO': 'Zone C',
'WADI-E-AZIZ SHARIF': 'Zone C',
WAH: 'Zone A', // changed to Zone A
WAISA: 'Zone C',
'WAN BHACHRAN': 'Zone C',
WANA: 'Zone C',
'WANIKEE TARAD': 'Zone C',
'WAPDA CITY': 'Zone C',
'WARCHA SALT MINES': 'Zone C',
WARBUTTON: 'Zone C',
'WARPAL CHAHTA': 'Zone C',
WARTAIR: 'Zone C',
WARRAH: 'Zone C',
'WARYAMA WALA': 'Zone C',
WASHBOOD: 'Zone C',
UTHAL: 'Zone C',
WAZIRABAD: 'Zone A', // changed to Zone A
WINDER: 'Zone C',
YAZMAN: 'Zone A', // changed to Zone A
'YOUSAF WALA': 'Zone C',
ZAFARWAL: 'Zone A', // changed to Zone A
'ZAHEERABAD DSIT KASUR': 'Zone C',
ZAHIRPEER: 'Zone C',
ZHOB: 'Zone C',
'ZIA ABBAD': 'Zone C',
ZIARAT: 'Zone C',
'GARHA MORR': 'Zone C',
ISLAMKOT: 'Zone C',
JARANWALA: 'Zone A', // changed to Zone A
BAHAWALPUR: 'Zone A', // changed to Zone A
// zone c start
'42 DB- YAZMAN': 'Zone C',
'90 MOR': 'Zone C',
'AALU MEHAR': 'Zone C',
'ABBAS PUR': 'Zone C',
ABDARA: 'Zone C',
'ADAMKE CHEEMA': 'Zone C',
'ADDA 98/FATHE': 'Zone C',
'ADDA CHAK': 'Zone C',
'ADDA CHAK ABDULLAH': 'Zone C',
'ADDA DALLAN BANGLOW': 'Zone C',
'ADDA DEWAN SB': 'Zone C',
'ADDA JAMALIRA': 'Zone C',
'ADDA KASSOWALA': 'Zone C',
'ADDA KOTAN': 'Zone C',
'ADDA LANDO MASJID': 'Zone C',
'ADDA PARMAT': 'Zone C',
'ADDA PULLMURAD': 'Zone C',
'ADDA ROUTI': 'Zone C',
'ADDA SAHUKA': 'Zone C',
'ADDA SHEIKH WAHAN': 'Zone C',
'ADDA SIRAJ': 'Zone C',
'AHMAD NAGAR': 'Zone C',
'AHMED NAGAR': 'Zone C',
'AHMED PUR': 'Zone C',
'AHMEDABAD KLP ROAD': 'Zone C',
'AHTTA-SANGJANI-TAXILA': 'Zone C',
'AIMNA BAD TOWN': 'Zone C',
'AKAL GARH': 'Zone C',
'AKRAM ABAD': 'Zone C',
'ALI CHAK': 'Zone C',
'ALIYABAD - GILGIT': 'Zone C',
ALKHALILPETRO: 'Zone C',
'ALLAH DAND DERI': 'Zone C',
ALLAI: 'Zone C',
'AMAN DARA': 'Zone C',
'AMBERI KALA CHOWK': 'Zone C',
AMBOR: 'Zone C',
'AMEER WALA': 'Zone C',
'AMIN GARH': 'Zone C',
'AMINANI SHARIF': 'Zone C',
ANBAR: 'Zone C',
'ARIF KHTIAN': 'Zone C',
'ARJA - BAGH': 'Zone C',
'ARRAY WAHIN - MAILSI': 'Zone C',
ATTAWA: 'Zone C',
'AZIZ PUR': 'Zone C',
'BABAY BERI': 'Zone C',
BADAAR: 'Zone C',
'BADHA BEER': 'Zone C',
BADIANA: 'Zone C',
'BADO MALHI': 'Zone C',
BAEJI: 'Zone C',
'BAGH - JHANG': 'Zone C',
'BAGHO BAHAR': 'Zone C',
'BAGHY WALA': 'Zone C',
'BAGO BHUTTO': 'Zone C',
'BAGWAL AWAN': 'Zone C',
'BAHDAR KALLI': 'Zone C',
'BAHRAM HATHION': 'Zone C',
BAHTAR: 'Zone C',
'BAIG CHAK': 'Zone C',
'BAJA - TOPI': 'Zone C',
'BAKAR KHAN': 'Zone C',
BALA: 'Zone C',
'BALA GARHI': 'Zone C',
'BALA GUJRAN': 'Zone C',
'BALAN WALA': 'Zone C',
BALWARA: 'Zone C',
BAMBANWALA: 'Zone C',
'BANDA JAT': 'Zone C',
BANDHI: 'Zone C',
BANDIAL: 'Zone C',
'BANGLOW YATEEM WALA DISTRIC NGR/HRN': 'Zone C',
'BANGUL DERO': 'Zone C',
'BAR MUSA': 'Zone C',
BARIAN: 'Zone C',
BARJAH: 'Zone C',
'BASHIR ABAD': 'Zone C',
'BASSI WALA': 'Zone C',
'BASTI GOTH JURRA': 'Zone C',
'BASTI MALOOK': 'Zone C',
'BASTI M NAWAZ': 'Zone C',
'BASTI MANZOORABAD': 'Zone C',
'BASTI MITHOU': 'Zone C',
'BASTI NAU': 'Zone C',
BEGOWAL: 'Zone C',
BEKNAWALA: 'Zone C',
BELHARO: 'Zone C',
BERANI: 'Zone C',
'BERO CHANDIO': 'Zone C',
BHAGO : 'Zone C',
'BHADEY WALA': 'Zone C',
'BHAGOWAL KALAN': 'Zone C',
BHALANGAN: 'Zone C',
BHALOWALI: 'Zone C',
BHANBOODI: 'Zone C',
'BHANO KEY': 'Zone C',
BHAOWAL: 'Zone C',
'BHAR CHUNDI SHARIF': 'Zone C',
BHARATH: 'Zone C',
BHELAR: 'Zone C',
'BHOON KALAN': 'Zone C',
'BHOPAL WALA': 'Zone C',
BHUBAK: 'Zone C',
BHURBAN: 'Zone C',
BILOMAR: 'Zone C',
'BLOCH - RAWALAKOT': 'Zone C',
BOBKANWALA: 'Zone C',
BOLLA: 'Zone C',
'BOMA BATH': 'Zone C',
BONGA: 'Zone C',
'BORA JHUNGAL': 'Zone C',
'BORHY WALI': 'Zone C',
'BOTALA JHANDA SINGH': 'Zone C',
'BOTALA SHARM SINGH': 'Zone C',
BOWANJ: 'Zone C',
'BUCHAL KALAN': 'Zone C',
'BUCHIANA MANDI': 'Zone C',
BUKERA: 'Zone C',
'BUKSHI PUL': 'Zone C',
JIWANI: 'Zone C',
BURJHAN: 'Zone C',
BURYWALI: 'Zone C',
BUTRANWALI: 'Zone C',
'BUXAN KHAN': 'Zone C',
CAHICHIAN: 'Zone C',
'CAHK NAZAM': 'Zone C',
'CHACK # 22': 'Zone C',
'CHAGHAR MATTI': 'Zone C',
'CHAK # 01': 'Zone C',
'CHAK # 1 NB': 'Zone C',
'CHAK # 100': 'Zone C',
'CHAK AKA': 'Zone C',
'CHAK AMRU': 'Zone C',
'CHAK JAMAL': 'Zone C',
'CHAK CHATTA': 'Zone C',
'CHAK DAULAT': 'Zone C',
'CHAK MANDHAR': 'Zone C',
'CHAK MUDDRASA DISTRIC BAHAWAL NAGAR': 'Zone C',
'CHAK QAZI': 'Zone C',
'CHAKO MORE': 'Zone C',
CHAMAKNI: 'Zone C',
'CHANB RIVER': 'Zone C',
'CHANDAN MORI': 'Zone C',
CHANDOWAL: 'Zone C',
CHANDRAL: 'Zone C',
CHANDRAMI: 'Zone C',
'CHAR BAGH': 'Zone C',
'CHANNI CHOWK': 'Zone C',
CHAPRAR: 'Zone C',
CHARPARIZA: 'Zone C',
CHELA: 'Zone C',
'CHENJI - TALAGANG': 'Zone C',
'CHICHO KI MALLIAN': 'Zone C',
CHILAIANWALA: 'Zone C',
CHILLA: 'Zone C',
'CHIMRAN WALI': 'Zone C',
CHITABATTA: 'Zone C',
CHITTAN: 'Zone C',
'CHITTAR PARI': 'Zone C',
'CHOHA SHAREEF': 'Zone C',
'CHOHAR JAMALI': 'Zone C',
'CHOOHAR POOR': 'Zone C',
'CHOPER HATTA': 'Zone C',
'CHOTTI ZAREEN': 'Zone C',
'CHOWK QURESHI': 'Zone C',
'CHUNI GOTH': 'Zone C',
'COMPANY BAGH': 'Zone C',
DAGAR: 'Zone C',
'DAIRA DIN PANAH': 'Zone C',
'DAK THIBBAN': 'Zone C',
DALOWAL: 'Zone C',
DALOWALI: 'Zone C',
'DALBI WALA': 'Zone C',
DAMAN: 'Zone C',
DAMDOR: 'Zone C',
DARI: 'Zone C',
DASUHA: 'Zone C',
DATOOTE: 'Zone C',
'DEARA BAKAH': 'Zone C',
'DEEN PUR SHARIF': 'Zone C',
'DEH MANAHRO': 'Zone C',
'DEH SOHU': 'Zone C',
'DELHA CHATHA': 'Zone C',
'DEWAN CITY - THATTA': 'Zone C',
DHABEJI: 'Zone C',
DHAAK: 'Zone C',
DHABOOLA: 'Zone C',
DHAKKI: 'Zone C',
'DHADO BASRA': 'Zone C',
DHALA: 'Zone C',
DHAMOKEY: 'Zone C',
DHAMRAH: 'Zone C',
DHANDHALA: 'Zone C',
'DHANNI SYDDEN': 'Zone C',
DHARIWAL: 'Zone C',
DHATMAL: 'Zone C',
'DHEERA SANDHA': 'Zone C',
'DHILA WALI': 'Zone C',
DHONIKE: 'Zone C',
'DHOON KALAN': 'Zone C',
DHRMAN: 'Zone C',
'DIL CHAK': 'Zone C',
'DILAWAR CHEEMA': 'Zone C',
'DINO MAKO': 'Zone C',
'DIYONA MANDI': 'Zone C',
DOADAI: 'Zone C',
'DONGA BONGA': 'Zone C',
'DRIBH MEHAR SHAH': 'Zone C',
'DUBURGI ARAYAN': 'Zone C',
DULCHEKAY: 'Zone C',
DUMELI: 'Zone C',
'DURAN PUR': 'Zone C',
'FAQAIR KALLI': 'Zone C',
'FAQIR ABAD': 'Zone C',
'FATEH PUR - MAILSI': 'Zone C',
'FEROZ WALA': 'Zone C',
GADYALA: 'Zone C',
'GALOTIAN MORE': 'Zone C',
GANJIWALI: 'Zone C',
'GANSAR PURA': 'Zone C',
'GARHI CHAKAR': 'Zone C',
'GARHI IKHTIAR KHAN': 'Zone C',
'GARHI KHUDA BUX': 'Zone C',
'GARI JALA': 'Zone C',
'GHAKKA MITTER': 'Zone C',
GHARHO: 'Zone C',
'GHARI DOOLAT ZAI': 'Zone C',
'GHARI GHUES': 'Zone C',
GHARIAL: 'Zone C',
GHARICHAND: 'Zone C',
GHARMALA: 'Zone C',
'GHASEET PUR': 'Zone C',
'GHAZI GHAT': 'Zone C',
'GHAZI WAL': 'Zone C',
GHORSIA: 'Zone C',
GHRARTAL: 'Zone C',
'GHULAB LAGHARI': 'Zone C',
GHULAMULLAH: 'Zone C',
'GILAN CHAK': 'Zone C',
'GILMALA ADDA': 'Zone C',
GOLARCHI: 'Zone C',
'GUL MERI': 'Zone C',
GULAYANA: 'Zone C',
'GULI GARAM': 'Zone C',
'GULLEN KHEL': 'Zone C',
'GULSHAN-E- NASIR': 'Zone C',
GUNNA: 'Zone C',
GURMANI: 'Zone C',
'HABIB PURA': 'Zone C',
HAJIPUR: 'Zone C',
'HAJI SHAH': 'Zone C',
'HAKIM SHAH': 'Zone C',
'HAJI WALA': 'Zone C',
HAMAYOON: 'Zone C',
'HAMEED PUR': 'Zone C',
HANZAL: 'Zone C',
HARAR: 'Zone C',
HARAYAM: 'Zone C',
'HARI PUR': 'Zone C',
HARSIAN: 'Zone C',
'HASSAN WALI': 'Zone C',
'HEAD PAKA': 'Zone C',
HINGORO: 'Zone C',
'HUSAIN PUR': 'Zone C',
INJRA: 'Zone C',
'ISLAM GARH': 'Zone C',
ISMAILA: 'Zone C',
JAGRAWAN: 'Zone C',
JAHANGHIR: 'Zone C',
'JAHANGI WALA': 'Zone C',
JAKKAR: 'Zone C',
'JALAL PURA': 'Zone C',
JALALABAD: 'Zone C',
'JAMAL PUR': 'Zone C',
JAMALABAD: 'Zone C',
'JAMKEY CHEEMA': 'Zone C',
JATLAN: 'Zone C',
JHAMPIR: 'Zone C',
JURIAN: 'Zone C',
JUTAL: 'Zone C',
KAKARR: 'Zone C',
KAKAYWALI: 'Zone C',
'KALA GUJRAN': 'Zone C',
'KALA KALAN': 'Zone C',
KAMARABAD: 'Zone C',
'KAMARO SHARIF': 'Zone C',
'KARAM DAD QURESHI': 'Zone C',
KARARIWALA: 'Zone C',
'KARIAN WALA': 'Zone C',
'KARIO GHANWAR': 'Zone C',
'KARMA ABAD': 'Zone C',
KARNANA: 'Zone C',
KARYALA: 'Zone C',
KASISY: 'Zone C',
KATHAR: 'Zone C',
KEELAY: 'Zone C',
KEHAR: 'Zone C',
KHADHAN: 'Zone C',
KHADRO: 'Zone C',
KHAIGALA: 'Zone C',
'KHAIR ABAD': 'Zone C',
'KHAIRA GALI': 'Zone C',
'KHALIQ ABAD': 'Zone C',
KHAMBRA: 'Zone C',
'KHAN MOHAMMAD SUDR': 'Zone C',
'KHAN PUR JAMALI': 'Zone C',
KHANNA: 'Zone C',
KHANSAR: 'Zone C',
'KHATO KEE': 'Zone C',
KHICHIWALA: 'Zone C',
'KHIDDER WALA': 'Zone C',
'KHOI ADDA': 'Zone C',
'KHOJAY CHAK': 'Zone C',
'KHOLU WALA': 'Zone C',
'Kholyan Bala': 'Zone C',
'KHOMBI PURAN': 'Zone C',
'KHORI ALAM': 'Zone C',
KHOSKI: 'Zone C',
KHORWAH: 'Zone C',
KHUDABAD: 'Zone C',
'KHUDDAIN KHAS': 'Zone C',
'KHUDIAN KHAN': 'Zone C',
KHYBER: 'Zone C',
'KOHALA MUZAFAR ABAD': 'Zone C',
'KOKIAN WALA': 'Zone C',
KOLACHI: 'Zone C',
'KOLIA SHAH JUSSAIN': 'Zone C',
'KOLO TARRAR': 'Zone C',
'KOT (CHARBAGH)': 'Zone C',
'KOT BULLO': 'Zone C',
'KOT FAQRAN': 'Zone C',
'KOT JAMIL': 'Zone C',
'KOT JAY SINGH': 'Zone C',
'KOT KAMUN SHAH': 'Zone C',
'KOT KHIZRI': 'Zone C',
'KOT LAKHNANA': 'Zone C',
'KOT LALU': 'Zone C',
'KOT MITTHAN': 'Zone C',
'KOT PINDI DAS': 'Zone C',
'KOT PROYA': 'Zone C',
'KOT QUTAB': 'Zone C',
'KOT RAINA': 'Zone C',
'KOT SABZAL': 'Zone C',
'KOT SHAKIR': 'Zone C',
'KOT SULTAN': 'Zone C',
'KOT SHERA': 'Zone C',
'KOT THAIRA': 'Zone C',
'KOTLA ESSAN': 'Zone C',
'KOTLA AMBANWALA': 'Zone C',
'KOTLA MOOSA KHAN': 'Zone C',
'KOTLA NASEER': 'Zone C',
'KOTLA PATHAN': 'Zone C',
'KOTLA QASIM': 'Zone C',
'KOTLY ALLAH YAAR': 'Zone C',
'KOTLY SAIAN': 'Zone C',
'KOTLY SATYAN - RAWALPINDI': 'Zone C',
'KOZ &BAR BANDI': 'Zone C',
'KUND - NOW': 'Zone C',
'KUNJAN (KUNJAH)': 'Zone C',
LAHRI: 'Zone C',
'LAL SOHANA': 'Zone C',
'LALAZAR - CHOWK AZAM': 'Zone C',
'LALU PUR': 'Zone C',
'LANDI ARAB': 'Zone C',
LANGARPUR: 'Zone C',
LARAMA: 'Zone C',
'LOWER TOPA': 'Zone C',
'MACHI KHOKHAR': 'Zone C',
'MAINI - TOPI': 'Zone C',
MAINGARI: 'Zone C',
'MANDI SADIQ GUNJ': 'Zone C',
'MANGLA CANTT': 'Zone C',
MATTA: 'Zone C',
'MEHAR SHAH': 'Zone C',
'MIR PUR BATHORO': 'Zone C',
'MIRPUR BHUTTO': 'Zone C',
MITHANI: 'Zone C',
'MOHAR SHARIF': 'Zone C',
'MUHAMMAD PUR LAMMA': 'Zone C',
'MUNDEKE GORAIYA': 'Zone C',
'MUSTAFA ABAD': 'Zone C',
'MUSTAFABAD LALYANI': 'Zone C',
'NASAR PUR': 'Zone C',
'NAT KALAN': 'Zone C',
'NAWAB PUR': 'Zone C',
'NAWAN KOT': 'Zone C',
'NEW CITY ISLAM GARH': 'Zone C',
NINDO: 'Zone C',
NOKHAR: 'Zone C',
'NOOR PUR NAHAR': 'Zone C',
ORMARA: 'Zone C',
NOUGRAN: 'Zone C',
'OLD LALAMUSA': 'Zone C',
'PAHAR PUR - LAYYAH': 'Zone C',
PALIALA: 'Zone C',
PAKHWAAL: 'Zone C',
PANDOKAY: 'Zone C',
PANGRIO: 'Zone C',
PANJPIR: 'Zone C',
PANR: 'Zone C',
PANYALA: 'Zone C',
PARI: 'Zone C',
'PEER GALI': 'Zone C',
'PEER KOT': 'Zone C',
'PERO SHAH': 'Zone C',
'PERU CHAK': 'Zone C',
PETARO: 'Zone C',
'Pharala/Mankrai': 'Zone C',
PHUL: 'Zone C',
PHULJI: 'Zone C',
'PIARO GOTH': 'Zone C',
'PIND MUNDA': 'Zone C',
'PIND MUNIM': 'Zone C',
'PIND SULTANI': 'Zone C',
'PINDI BOHRI': 'Zone C',
'PINDI GUJRAN': 'Zone C',
'PIYARO LUND': 'Zone C',
'PMA KAKUL': 'Zone C',
PONA: 'Zone C',
POTHI: 'Zone C',
'PULL 114/1R': 'Zone C',
'PULL DAWA': 'Zone C',
'PULL SANNY': 'Zone C',
'PULMUNDA QML': 'Zone C',
'PUNJAN KASAN': 'Zone C',
PURAAN: 'Zone C',
QADARABAD: 'Zone C',
QALDARA: 'Zone C',
'QASBA KARYALI': 'Zone C',
'QAZI ARIF': 'Zone C',
'QAZI PUR - TARBELA': 'Zone C',
'QILA AHMAD BAD': 'Zone C',
'QILA KALAWALA': 'Zone C',
'QILA RAM RANG': 'Zone C',
RAHARKI: 'Zone C',
'RAHMAT ABAD - KARAK': 'Zone C',
RAHUKI: 'Zone C',
'RAJA JANG': 'Zone C',
'RAJA RAM': 'Zone C',
RAJAR: 'Zone C',
'RAJAR KALAN': 'Zone C',
'RAJJAR KHURRAD': 'Zone C',
'RAJOA SAADAT': 'Zone C',
'RAJU KHANANI': 'Zone C',
'RAKH GHULAMA': 'Zone C',
'RAKH KIKRAN WALAI': 'Zone C',
'RAM KEY CHATHA': 'Zone C',
'RAM RAYIAN': 'Zone C',
RAMYSHAH: 'Zone C',
'RANG PURA': 'Zone C',
'RANJA MAIRA': 'Zone C',
RANJAI: 'Zone C',
RANO: 'Zone C',
RASHAKAI: 'Zone C',
'RASHEED ABAD': 'Zone C',
'RASHID ABAD': 'Zone C',
'RASOOL NAGAR': 'Zone C',
'RASOOL PUR': 'Zone C',
'RASOOL PUR JANDAY ALA': 'Zone C',
'RASOOL PUR TARRAR': 'Zone C',
RASOOLABAD: 'Zone C',
RATAS: 'Zone C',
'RATHOA M ALI': 'Zone C',
RATTA: 'Zone C',
'RAZI DERO': 'Zone C',
'REHAN CHEEMA': 'Zone C',
Rehana: 'Zone C',
Chapra: 'Zone C',
'REHMAN TOWN': 'Zone C',
'REHMATA BAD': 'Zone C',
REHTARY: 'Zone C',
RETI: 'Zone C',
ROHILANWALI: 'Zone C',
ROJHAN: 'Zone C',
ROSHANABAD: 'Zone C',
'ROSHEN BHAIT': 'Zone C',
ROTANI: 'Zone C',
ROTHI: 'Zone C',
'RUKAN BURRA': 'Zone C',
'RUPAFIL SHARAQPUR ROAD': 'Zone C',
'SABAZ PEER': 'Zone C',
'SABU RAO': 'Zone C',
SADIQBAD: 'Zone C',
SADOKEY: 'Zone C',
SAEEDPUR: 'Zone C',
'SAGIL ABAD': 'Zone C',
SAGRI: 'Zone C',
SAHAR: 'Zone C',
'SAHARN CHATHA': 'Zone C',
SAHIANWALA: 'Zone C',
SAHOWALA: 'Zone C',
'SAID NAGAR': 'Zone C',
'SAID PUR': 'Zone C',
'SAIDA GOAL': 'Zone C',
'SAIN DINO MALIK': 'Zone C',
SAKARDARA: 'Zone C',
'SAKHI SARWER': 'Zone C',
SAKWARE: 'Zone C',
SALARWAHAN: 'Zone C',
'SALEEM ABAD': 'Zone C',
'SALEEM KHAN': 'Zone C',
'SALHAD VILLAGE': 'Zone C',
SALKHAADAR: 'Zone C',
'SALLAH DI KHUI': 'Zone C',
'SALONI JHAL': 'Zone C',
SAMAHNI: 'Zone C',
'SAMALL SHAREEF': 'Zone C',
'SAMAND WALA': 'Zone C',
'SANG NAKA': 'Zone C',
SANGHI: 'Zone C',
SANGOTA: 'Zone C',
SANKHTRA: 'Zone C',
'SARAI MUGHAL PHOOL NAGAR': 'Zone C',
SARANDA: 'Zone C',
'SARDAR GARH': 'Zone C',
SARHARI: 'Zone C',
SARWALA: 'Zone C',
SATRAH: 'Zone C',
'SAWAR GALI': 'Zone C',
SEHYOKEY: 'Zone C',
'SER DHERI': 'Zone C',
'SHADAN LUND': 'Zone C',
'SHAEIKH UMAIR': 'Zone C',
'SHAH JAHANIYA': 'Zone C',
'SHAH JAMAL': 'Zone C',
'SHAH MAQSOOD': 'Zone C',
'SHAH PUR': 'Zone C',
'SHAHAB PURA': 'Zone C',
'SHAHBAZ KHEL': 'Zone C',
'SHAHPUR JHANIA': 'Zone C',
'SHAHRAN CHAHTA': 'Zone C',
SHAKRELA: 'Zone C',
'SHAL DHANI': 'Zone C',
SHAMSPUR: 'Zone C',
SHAROTE: 'Zone C',
'SHEEN BAGH': 'Zone C',
'SHEIKH BHIRKIO': 'Zone C',
'SHER PUR': 'Zone C',
'SHER SULTAN': 'Zone C',
'SHIKARPUR - RJP': 'Zone C',
SHIKIOTE: 'Zone C',
SHINEE: 'Zone C',
'SHRIN KOTAY': 'Zone C',
'SIBI BY PASS': 'Zone C',
'SIDDIQ KALWAR': 'Zone C',
'SIKANDAR ABAD': 'Zone C',
'SIKHANIWALA / MEHRAYWALA': 'Zone C',
'MEHRAYWALA': 'Zone C',
'SIKHANIWALA': 'Zone C',
SIRANWALI: 'Zone C',
'SKINDAR TOWN': 'Zone C',
'SUI GAS THARHI MIR WAH DISTRICT KHAIR PUR MIRS': 'Zone C',
'SUI GAS VIA T.MIR WAH': 'Zone C',
'SULTAN KOT': 'Zone C',
'SURAG GALI': 'Zone C',
SURAKHI: 'Zone C',
'SURBANDER - GAWADAR': 'Zone C',
'SURDAG - KARAK': 'Zone C',
'SYDAN WALI': 'Zone C',
'SYED PUR SHARIF': 'Zone C',
'SYED WALA': 'Zone C',
TAIQABAD: 'Zone C',
'TAJ GARH': 'Zone C',
'TAJ PUR': 'Zone C',
TAJOKEY: 'Zone C',
TAJORI: 'Zone C',
TALHAR: 'Zone C',
TALHARA: 'Zone C',
'TALWANDI BHINDRAN': 'Zone C',
'TALWANDI KHJOOR WALI': 'Zone C',
'TALWANDI MOOSA KHAN': 'Zone C',
TANDA: 'Zone C',
TANDAR: 'Zone C',
'TANDO BAGHO': 'Zone C',
'TANDO GHULAM HAIDER': 'Zone C',
'TANDO JAN MUHAMMAD': 'Zone C',
'TANDO MIR ALI': 'Zone C',
'TANDO QAISAR': 'Zone C',
'TANDO SAINDAD': 'Zone C',
'TANDO SOOMRO': 'Zone C',
TARAPA: 'Zone C',
'THAHT NASRATI': 'Zone C',
'THAKAR KEY': 'Zone C',
'THAKRAN MAHEY': 'Zone C',
THALWARI: 'Zone C',
'THANA SADDAR': 'Zone C',
'THANIL FATUI': 'Zone C',
THAPLA: 'Zone C',
THARA: 'Zone C',
'THARI MOHABBAT': 'Zone C',
'THATHA LAKHI': 'Zone C',
'THATHI ARAYAN': 'Zone C',
'THATTA SADIQ ABAD': 'Zone C',
THIKRIYA: 'Zone C',
'TIBBA QADIR ABAD': 'Zone C',
'TIBBI IZAT - AHMED PUR EAST': 'Zone C',
'TIBBI LARANA': 'Zone C',
'TITTAR KHEL': 'Zone C',
TOPA: 'Zone C',
TORU: 'Zone C',
TOTAKAN: 'Zone C',
UBHRI: 'Zone C',
'UMER GUL NAWAN KALI': 'Zone C',
'UMER ZAI': 'Zone C',
'USMAN SHAH': 'Zone C',
'USMAN SHAH HURI': 'Zone C',
USMANABAD: 'Zone C',
VANIA: 'Zone C',
'VAR - THATTA': 'Zone C',
VANJARI: 'Zone C',
'VARPAL CHATTA': 'Zone C',
VEROWALA: 'Zone C',
'VIJIAN WALA': 'Zone C',
'VILL DHANI BUX PHULL': 'Zone C',
'VILL BANGHI': 'Zone C',
'VILL GANGI': 'Zone C',
'VILL HAJI GH HYDER PHULL': 'Zone C',
'VILL ISLAM KHAN LASHARI': 'Zone C',
'VILL SOOFI REHMATULLAH': 'Zone C',
'VILL WALI MOHAMMAD KORAI': 'Zone C',
'VILLAGE ABDUL QADIR CHOWK': 'Zone C',
'VILLAGE AHMED MIAN': 'Zone C',
'VILLAGE BANGRILA': 'Zone C',
'Village Chamba': 'Zone C',
'VILLAGE JAMMBER': 'Zone C',
'VILLAGE JUMO BHUTTO': 'Zone C',
'VILLAGE QALOO BURIRO': 'Zone C',
'VNEKAY TARRAR': 'Zone C',
'WADALA SANDHUWAN': 'Zone C',
'WADHALA CHEEMA': 'Zone C',
'WADI PATNI': 'Zone C',
'WAH VILLAGE': 'Zone C',
'WANGO SHARIF': 'Zone C',
'WARSAK GARRISON': 'Zone C',
'WASAN KEY': 'Zone C',
WASU: 'Zone C',
'WESENDAY WALI': 'Zone C',
'WILL PIER DAD': 'Zone C',
'WOODY GRAM': 'Zone C',
'YARO LUND': 'Zone C',
'YATEEMWALA - CHISHTIAN': 'Zone C',
'ZAFAR ABAD': 'Zone C',
'ZAFFAR ABAD': 'Zone C',
ZAIDA: 'Zone C',
'ZAROBI - TOPI': 'Zone C',

};

// Define a Counter model for auto-incrementing companyId
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

export const CompanyIdModel = mongoose.model('CompanyIdModel', CounterSchema);
// Helper function to get the next companyId
const getNextCompanyId = async () => {
  const counter = await CompanyIdModel.findOneAndUpdate(
    { _id: 'companyId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true}
  );
  return `LX${counter.seq}`;
};

// Normalize cityToZone keys to uppercase
export const normalizedCityToZone = Object.keys(cityToZone).reduce((acc, key) => {
  acc[key.toUpperCase()] = cityToZone[key];
  return acc;
}, {});


export const getDeliveryCharge = async (shipper, zoneName, netWeight, destinationCityName, originCityName, shipmentType, companyName) => {
  const DEFAULT_DC = 0;

  // Validate inputs
  if (!shipper || !shipper.template || !netWeight || !shipmentType || !companyName) {
    console.log('getDeliveryCharge: Missing required inputs - shipper, template, netWeight, shipmentType, or companyName');
    return DEFAULT_DC;
  }

  // Check if cities are valid
  const originValid = originCityName && String(originCityName).trim() !== '';
  const destinationValid = destinationCityName && String(destinationCityName).trim() !== '';
  const isWithinCity = originValid && destinationValid && String(originCityName).trim().toLowerCase() === String(destinationCityName).trim().toLowerCase();

  let effectiveZoneName;
  if (!originValid || !destinationValid) {
    effectiveZoneName = 'ZoneC';
  } else if (isWithinCity) {
    effectiveZoneName = 'WithinCity';
  } else if (zoneName && zoneName.toLowerCase() !== 'unknown') {
    effectiveZoneName = zoneName.replace(/\s/g, '');
  } else {
    effectiveZoneName = 'ZoneC';
  }

  console.log(`getDeliveryCharge: OriginValid: ${originValid}, DestinationValid: ${destinationValid}, WithinCity: ${isWithinCity}, ZoneName: ${zoneName}, EffectiveZone: ${effectiveZoneName}`);

  // Validate weight
  const weightInKg = Number(netWeight);
  if (isNaN(weightInKg) || weightInKg <= 0) {
    console.log(`getDeliveryCharge: Invalid weight - ${netWeight} -> ${weightInKg}`);
    return DEFAULT_DC;
  }

  // ── Weight rounding ──────────────────────────────────────────
  // 0 to 0.500 → 0.500 slab
  // 0.501+ → ceil to next whole kg (1.1→2, 4.9→5, 5.1→6)
  let weightToUse;
  if (weightInKg <= 0.500) {
    weightToUse = 0.500;
  } else {
    weightToUse = Math.ceil(weightInKg);
  }

  // Fetch template
  try {
    console.log(`getDeliveryCharge: Fetching template for ID: ${shipper.template}`);
    const template = await ShipperTemplates.findById(shipper.template);
    if (!template) {
      console.log(`getDeliveryCharge: Template not found for ID: ${shipper.template}`);
      return DEFAULT_DC;
    }
    console.log(`getDeliveryCharge: Template fetched. Zones: ${Object.keys(template.zones || {})}`);

    // Normalize shipment type and courier
    const effectiveShipmentType = shipmentType.charAt(0).toUpperCase() + shipmentType.slice(1).toLowerCase();
    const courier = companyName.toLowerCase();

    console.log(`getDeliveryCharge: ShipmentType: ${effectiveShipmentType}, Courier: ${courier}, WeightToUse: ${weightToUse}`);

    const zoneData = template.zones[effectiveShipmentType]?.[effectiveZoneName];
    if (!zoneData) {
      console.log(`getDeliveryCharge: ZoneData not found for ShipmentType: ${effectiveShipmentType}, Zone: ${effectiveZoneName}`);
      return DEFAULT_DC;
    }
    console.log(`getDeliveryCharge: ZoneData found. Entries count: ${zoneData.entries?.length || 0}`);

    const { entries, additionalKG } = zoneData;
    const plainAdditionalKG = additionalKG && typeof additionalKG === 'object'
      ? JSON.parse(JSON.stringify(additionalKG)) : {};
    console.log(`getDeliveryCharge: AdditionalKG keys: ${Object.keys(plainAdditionalKG)}`);

    let selectedEntry = null;
    let baseAmount = 0;
    let additionalCharge = 0;

    // Helper: courier ki entries sorted by min weight ascending
    const getCourierEntries = () => entries
      .filter(e => e.courier.toLowerCase() === courier)
      .sort((a, b) => Number(a.weight.split(' to ')[0]) - Number(b.weight.split(' to ')[0]));

    // Helper: additionalKG per kg for courier
    const getCourierAdditional = () => {
      const key = Object.keys(plainAdditionalKG).find(k => k.toLowerCase() === courier);
      if (!key) return null;
      const val = Number(plainAdditionalKG[key]);
      return isNaN(val) || val <= 0 ? null : val;
    };

    if (effectiveShipmentType === 'Overnight') {
      console.log(`getDeliveryCharge: Processing Overnight`);

      // 0 to 0.500 → direct slab match
      if (weightToUse <= 0.500) {
        selectedEntry = entries.find(entry => {
          const [min, max] = entry.weight.split(' to ').map(w => Number(w.replace(' KG', '').trim()));
          return entry.courier.toLowerCase() === courier && weightToUse >= min && weightToUse <= max;
        });
        if (!selectedEntry) {
          console.log(`getDeliveryCharge: No slab found for 0.5kg overnight`);
          return DEFAULT_DC;
        }
        baseAmount = Number(selectedEntry.amount);
        console.log(`getDeliveryCharge: Overnight 0.5kg slab - Amount: ${baseAmount}`);
      } else {
        // > 0.500 → 1kg slab as base + additional for extra kgs
        selectedEntry = entries.find(entry => {
          const [min, max] = entry.weight.split(' to ').map(w => Number(w.replace(' KG', '').trim()));
          return entry.courier.toLowerCase() === courier && 1 >= min && 1 <= max;
        });
        if (!selectedEntry) {
          console.log(`getDeliveryCharge: No 1kg slab found for overnight`);
          return DEFAULT_DC;
        }
        baseAmount = Number(selectedEntry.amount);
        console.log(`getDeliveryCharge: Overnight 1kg base - Amount: ${baseAmount}`);

        if (weightToUse > 1) {
          const extraKgs = weightToUse - 1; // 3kg → 2 extra, 100kg → 99 extra
          const additionalPerKg = getCourierAdditional();
          console.log(`getDeliveryCharge: Overnight extraKgs: ${extraKgs}, additionalPerKg: ${additionalPerKg}`);
          if (additionalPerKg === null) {
            console.log(`getDeliveryCharge: No additionalKG found for courier ${courier}`);
            return DEFAULT_DC;
          }
          additionalCharge = extraKgs * additionalPerKg;
          console.log(`getDeliveryCharge: Overnight additional charge: ${additionalCharge}`);
        }
      }

    } else if (effectiveShipmentType === 'Detain') {
      console.log(`getDeliveryCharge: Processing Detain`);

      const courierEntries = getCourierEntries();
      if (courierEntries.length === 0) {
        console.log(`getDeliveryCharge: No entries for courier ${courier} in Detain`);
        return DEFAULT_DC;
      }

      const firstSlab = courierEntries[0];
      const lastSlab  = courierEntries[courierEntries.length - 1];
      const firstSlabMin = Number(firstSlab.weight.split(' to ')[0]);
      const lastSlabMax  = Number(lastSlab.weight.split(' to ')[1].replace(' KG', '').trim());

      console.log(`getDeliveryCharge: Detain - weightToUse: ${weightToUse}, firstSlabMin: ${firstSlabMin}, lastSlabMax: ${lastSlabMax}`);

      if (weightToUse <= firstSlabMin) {
        // Weight template k first slab sy kam → first slab lagao
        baseAmount = Number(firstSlab.amount);
        console.log(`getDeliveryCharge: Detain - weight <= firstSlab, using firstSlab amount: ${baseAmount}`);
      } else {
        selectedEntry = courierEntries.find(entry => {
          const [min, max] = entry.weight.split(' to ').map(w => Number(w.replace(' KG', '').trim()));
          return weightToUse >= min && weightToUse <= max;
        });

        if (selectedEntry) {
          baseAmount = Number(selectedEntry.amount);
          console.log(`getDeliveryCharge: Detain - Selected entry: ${selectedEntry.weight}, Amount: ${baseAmount}`);
        } else if (weightToUse > lastSlabMax) {
          baseAmount = Number(lastSlab.amount);
          const extraKgs = weightToUse - lastSlabMax;
          const additionalPerKg = getCourierAdditional();
          console.log(`getDeliveryCharge: Detain - Over lastSlab, Base: ${baseAmount}, ExtraKgs: ${extraKgs}, additionalPerKg: ${additionalPerKg}`);
          if (additionalPerKg === null) {
            console.log(`getDeliveryCharge: No additionalKG found for courier ${courier}`);
            return DEFAULT_DC;
          }
          additionalCharge = extraKgs * additionalPerKg;
          console.log(`getDeliveryCharge: Detain additional charge: ${additionalCharge}`);
        } else {
          console.log(`getDeliveryCharge: No entry found for weight ${weightToUse}kg in Detain`);
          return DEFAULT_DC;
        }
      }

    } else if (effectiveShipmentType === 'Overland') {
      console.log(`getDeliveryCharge: Processing Overland`);

      const courierEntries = getCourierEntries();
      if (courierEntries.length === 0) {
        console.log(`getDeliveryCharge: No entries for courier ${courier} in Overland`);
        return DEFAULT_DC;
      }

      const firstSlab = courierEntries[0];
      const lastSlab  = courierEntries[courierEntries.length - 1];
      const firstSlabMin = Number(firstSlab.weight.split(' to ')[0]);
      const lastSlabMax  = Number(lastSlab.weight.split(' to ')[1].replace(' KG', '').trim());

      console.log(`getDeliveryCharge: Overland - weightToUse: ${weightToUse}, firstSlabMin: ${firstSlabMin}, lastSlabMax: ${lastSlabMax}`);

      if (weightToUse <= firstSlabMin) {
        // Weight template k first slab sy kam → first slab lagao
        baseAmount = Number(firstSlab.amount);
        console.log(`getDeliveryCharge: Overland - weight <= firstSlab, using firstSlab amount: ${baseAmount}`);
      } else {
        selectedEntry = courierEntries.find(entry => {
          const [min, max] = entry.weight.split(' to ').map(w => Number(w.replace(' KG', '').trim()));
          return weightToUse >= min && weightToUse <= max;
        });

        if (selectedEntry) {
          baseAmount = Number(selectedEntry.amount);
          console.log(`getDeliveryCharge: Overland - Selected entry: ${selectedEntry.weight}, Amount: ${baseAmount}`);
        } else if (weightToUse > lastSlabMax) {
          baseAmount = Number(lastSlab.amount);
          const extraKgs = weightToUse - lastSlabMax;
          const additionalPerKg = getCourierAdditional();
          console.log(`getDeliveryCharge: Overland - Over lastSlab, Base: ${baseAmount}, ExtraKgs: ${extraKgs}, additionalPerKg: ${additionalPerKg}`);
          if (additionalPerKg === null) {
            console.log(`getDeliveryCharge: No additionalKG found for courier ${courier}`);
            return DEFAULT_DC;
          }
          additionalCharge = extraKgs * additionalPerKg;
          console.log(`getDeliveryCharge: Overland additional charge: ${additionalCharge}`);
        } else {
          console.log(`getDeliveryCharge: No entry found for weight ${weightToUse}kg in Overland`);
          return DEFAULT_DC;
        }
      }

    } else {
      console.log(`getDeliveryCharge: Unsupported shipment type: ${effectiveShipmentType}`);
      return DEFAULT_DC;
    }

    // Calculate total DC
    const totalDC = Math.ceil(baseAmount + additionalCharge);
    if (isNaN(totalDC)) {
      console.log(`getDeliveryCharge: TotalDC is NaN - Base: ${baseAmount}, Additional: ${additionalCharge}`);
      return DEFAULT_DC;
    }

    console.log(`getDeliveryCharge: Calculation complete - Base: ${baseAmount}, Additional: ${additionalCharge}, Total: ${totalDC}`);
    return totalDC;

  } catch (error) {
    console.error('getDeliveryCharge: Error occurred -', error);
    return DEFAULT_DC;
  }
};
// ─────────────────────────────────────────────────────────────
//  creditCheck.js
//  Universal credit check — sab bookPacket functions me use karo
// ─────────────────────────────────────────────────────────────


// ── Constants ────────────────────────────────────────────────
const RELIEF_LIMIT          = 1200;
const WARNING_THRESHOLD     = 1000;
const COD_ZERO_LIMIT        = 10;
const BOOKED_DEAD_HOURS     = 30;   // COD: Booked + 30hrs = dead COD
const ALL_STATUS_MAX_DAYS   = 30;   // COD: other statuses + 30 days = expired COD
const BOOKED_DEAD_DC_DAYS   = 3;    // DC:  Booked + 3 days = dead DC (don't charge)

const INELIGIBLE_STATUSES = [
  'Cancelled',
  'Returned to Shipper',
  'Return Confirmed',
];

const getEligibleCOD = async (shipperUserName) => {
  const deadlineForBooked = new Date();
  deadlineForBooked.setHours(deadlineForBooked.getHours() - BOOKED_DEAD_HOURS);

  const deadlineForOthers = new Date();
  deadlineForOthers.setDate(deadlineForOthers.getDate() - ALL_STATUS_MAX_DAYS);

  const candidateOrders = await leopardsOrdersmodal.find({
     'shipperInfo.userName': shipperUserName,
  codAmount:      { $gt: COD_ZERO_LIMIT },
  bcStatus:       { $nin: INELIGIBLE_STATUSES },
  isCodoInvoiced:  false,  // ← yeh add karo
}).lean();
  console.log(`[COD] Shipper: ${shipperUserName} | Candidate orders: ${candidateOrders.length} | Total raw COD: Rs. ${candidateOrders.reduce((s, o) => s + o.codAmount, 0)}`);

  if (candidateOrders.length === 0) return 0;

  

  let eligibleCOD      = 0;
  let deadBooked       = 0;
  let expiredOther     = 0;
  let paidOrders       = 0;

  for (const order of candidateOrders) {
    // Booked + 30hrs se purana = dead COD
    if (order.bcStatus === 'Booked' && new Date(order.createdAt) < deadlineForBooked) {
      deadBooked++;
      continue;
    }
    // Sab other statuses + 30 days se purana = expired COD
    if (order.bcStatus !== 'Booked' && new Date(order.createdAt) < deadlineForOthers) {
      expiredOther++;
      continue;
    }
    // CodInvoice Paid = skip
    

    eligibleCOD += order.codAmount;
  }

  console.log(`[COD] Eligible COD: Rs. ${eligibleCOD} | Dead Booked (>30hrs): ${deadBooked} | Expired other (>30days): ${expiredOther} | Paid: ${paidOrders}`);

  return eligibleCOD;
};

// ─────────────────────────────────────────────────────────────
//  HELPER: Total DC used (dead Booked orders exclude karo)
//
//  Dead DC = bcStatus Booked + 3 days se purana
//  Cancelled already excluded
//  Sab other statuses (In Transit, Delivered etc.) = count karo
// ─────────────────────────────────────────────────────────────
const getTotalDCUsed = async (shipperUserName) => {
  const deadlineForBookedDC = new Date();
  deadlineForBookedDC.setDate(deadlineForBookedDC.getDate() - BOOKED_DEAD_DC_DAYS);

  const orders = await leopardsOrdersmodal.find({
    'shipperInfo.userName': shipperUserName,
    isInvoiced: false,
    bcStatus:   { $ne: 'Cancelled' },
    $nor: [
      // Booked + 3 days se purana = dead DC
      { bcStatus: 'Booked', createdAt: { $lt: deadlineForBookedDC } },
    ],
  }).lean();

  const total = orders.reduce((sum, o) => sum + (o.deliveryCharge || 0), 0);
  console.log(`[DC] Shipper: ${shipperUserName} | Active orders for DC: ${orders.length} | Total DC used: Rs. ${total}`);
  return { total, count: orders.length };
};

// ─────────────────────────────────────────────────────────────
//  checkShipperCredit(shipperUserName, currentDC)
// ─────────────────────────────────────────────────────────────
export const checkShipperCredit = async (shipperUserName, currentDC, currentCodAmount = 0) => {


  // ─────────────────────────────────────────────────────────
  //  FREE PASS: COD order → seedha allow
  // ─────────────────────────────────────────────────────────
  if (currentCodAmount > 10) {
    console.log(`[CreditCheck] ✅ FREE PASS — COD order (Rs. ${currentCodAmount}) — no check\n`);
    return { allowed: true, remainingCredit: null };
  }

  const shipperDoc = await BuyerAndSeller.findOne({ userName: shipperUserName }).lean();
if (shipperDoc?.super?.isSupperShipper === true) {
  console.log(`[CreditCheck] ✅ SUPER SHIPPER — ${shipperUserName} — all checks bypassed\n`);
  return { allowed: true, remainingCredit: null };
}

  // ── STEP 1: Total DC used ─────────────────────────────────
  const { total: totalDCUsed } = await getTotalDCUsed(shipperUserName);
  console.log(`[CreditCheck] Total DC used: Rs. ${totalDCUsed}`);

  // ── STEP 2: Shipper balance ───────────────────────────────
  const balanceRequests = await ShipperBallance.find({
    shipperName: shipperUserName,
    status: 'Success',
  }).lean();

  const totalBalance    = balanceRequests.reduce((sum, r) => sum + (r.amount || 0), 0);
  const hasAddedBalance = balanceRequests.length > 0;

  console.log(`[CreditCheck] Balance: Rs. ${totalBalance} | Has added balance: ${hasAddedBalance}`);

const eligibleCODFromOrders = await getEligibleCOD(shipperUserName);
console.log(`[CreditCheck] Eligible COD (orders): Rs. ${eligibleCODFromOrders}`);

  // ── STEP 4: Unpaid CodInvoices ────────────────────────────
  const unpaidCodInvoices = await CodInvoice.find({
    userName: shipperUserName,
    status:   { $ne: 'Paid' },
  }).lean();

  const codInvoiceCredit = unpaidCodInvoices.reduce((sum, inv) => sum + (inv.codAmount || 0), 0);
  console.log(`[CreditCheck] Unpaid CodInvoices: ${unpaidCodInvoices.length} | Credit: Rs. ${codInvoiceCredit}`);

  // ── STEP 5: Unpaid DCInvoices remaining ──────────────────
  // Paid = remainingAmount 0 AND paidAmount == netAmount (10 tak faraq allow)
const unpaidDcInvoices = await DCInvoice.find({
  userName: shipperUserName,
}).lean();

const dcInvoiceCredit = unpaidDcInvoices.reduce((sum, inv) => {
  return sum + (inv.remainingAmount || 0); // negative bhi add hoga — net sum
}, 0);

  console.log(`[CreditCheck] DCInvoices: ${unpaidDcInvoices.length} | Net Credit: Rs. ${dcInvoiceCredit}`);

  // ── STEP 6: Total available credit ───────────────────────
  const totalCODCredit  = eligibleCODFromOrders + codInvoiceCredit + dcInvoiceCredit;
  console.log(`[CreditCheck] Total COD Credit: Rs. ${totalCODCredit} (Orders: ${eligibleCODFromOrders} + CodInv: ${codInvoiceCredit} + DCInv: ${dcInvoiceCredit})`);

  // ─────────────────────────────────────────────────────────
  //  FLOW A: Koi balance nahi → Relief mode
  // ─────────────────────────────────────────────────────────
  if (!hasAddedBalance) {
    const totalAfterBooking = totalDCUsed + currentDC;

    console.log(`[CreditCheck] FLOW A (Relief) | After booking: Rs. ${totalAfterBooking} | Limit: Rs. ${RELIEF_LIMIT}`);

    if (totalAfterBooking <= RELIEF_LIMIT) {
      const remaining = RELIEF_LIMIT - totalAfterBooking;
      console.log(`[CreditCheck] ✅ ALLOWED (Relief) | Remaining: Rs. ${Math.floor(remaining)}\n`);
      if (remaining <= WARNING_THRESHOLD) {
        console.warn(`[CreditCheck] ⚠️ WARNING | ${shipperUserName} | Relief nearly exhausted: Rs. ${Math.floor(remaining)}`);
      }
      return { allowed: true, remainingCredit: remaining };
    }

    // Relief cross → COD credit check
    console.log(`[CreditCheck] Relief limit crossed → Checking COD credit...`);
    const netCredit = totalCODCredit - totalDCUsed;

    console.log(`[CreditCheck] Net credit: Rs. ${netCredit} | Required: Rs. ${currentDC}`);

    if (netCredit < currentDC) {
      console.log(`[CreditCheck] ❌ BLOCKED\n`);
      return {
        allowed: false,
        message: `Insufficient balance. Relief limit of Rs. ${RELIEF_LIMIT} reached (DC used: Rs. ${Math.floor(totalDCUsed)}). Available COD credit: Rs. ${Math.floor(Math.max(netCredit, 0))}, Required: Rs. ${currentDC}. Please add balance.`,
      };
    }

    const remaining = netCredit - currentDC;
    console.log(`[CreditCheck] ✅ ALLOWED (COD) | Remaining: Rs. ${Math.floor(remaining)}\n`);
    if (remaining <= WARNING_THRESHOLD) {
      console.warn(`[CreditCheck] ⚠️ WARNING | ${shipperUserName} | Low credit: Rs. ${Math.floor(remaining)}`);
    }
    return { allowed: true, remainingCredit: remaining };
  }

  // ─────────────────────────────────────────────────────────
  //  FLOW B: Balance add kiya → Normal credit check
  // ─────────────────────────────────────────────────────────
  console.log(`[CreditCheck] FLOW B (Balance Mode)`);

  const availableCredit = totalBalance + totalCODCredit;
  const netCredit       = availableCredit - totalDCUsed;

  console.log(`[CreditCheck] Balance: Rs. ${totalBalance} | COD Credit: Rs. ${totalCODCredit} | Available: Rs. ${availableCredit} | DC used: Rs. ${totalDCUsed} | Net: Rs. ${netCredit} | Required: Rs. ${currentDC}`);

  if (netCredit < currentDC) {
    console.log(`[CreditCheck] ❌ BLOCKED\n`);
    return {
      allowed: false,
      message: `Insufficient balance. Available credit: Rs. ${Math.floor(Math.max(netCredit, 0))}, Required: Rs. ${currentDC}. Please add balance.`,
    };
  }

  const remaining = netCredit - currentDC;
  console.log(`[CreditCheck] ✅ ALLOWED | Remaining: Rs. ${Math.floor(remaining)}\n`);
  if (remaining <= WARNING_THRESHOLD) {
    console.warn(`[CreditCheck] ⚠️ WARNING | ${shipperUserName} | Low credit: Rs. ${Math.floor(remaining)}`);
  }
  return { allowed: true, remainingCredit: remaining };
};



const formatWhatsappPhoneNumber = (phone) => {
  if (!phone) return '';

  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0') && digits.length === 11) {
    return '+92' + digits.slice(1);
  }

  if (digits.startsWith('3') && digits.length === 10) {
    return '+92' + digits;
  }

  if (digits.startsWith('92') && digits.length === 12) {
    return '+' + digits;
  }

  if (digits.startsWith('923') && phone.startsWith('+')) {
    return phone;
  }

  return '+92' + digits.slice(-10);
};


const apiKey = "487F7B22F68312D2C1BBC93B1AEA445B1781948571";
const apiPassword = "12092917";
const baseUrl = 'https://merchantapi.leopardscourier.com/api';

// M&P API configuration
const mpConfig = {
  apiUrl: 'http://mnpcourier.com/mycodapi/api/Booking/InsertBookingData',
  citiesUrl: 'http://mnpcourier.com/mycodapi/api/Branches/Get_Cities',
  addLocationUrl: 'http://mnpcourier.com/mycodapi/api/Locations/AddLocation',
  username: process.env.MP_USERNAME || 'LIONEXCOURIER_API_281809', 
  password: process.env.MP_PASSWORD || 'raja1209G!',
  accountNo: process.env.MP_ACCOUNT_NO || '281809'
};

const apiKeyTrax = 'YmlhZFhZU2pPZTFQaW1ERll0bzJOeVRRVFB1MDlkOHRuNk5hdFkwRXQ5TW15UUF5dXF3bjRwUHlsSnY0684cc3fc41e7b';
const baseUrlTrax =  'https://sonic.pk/api';

const DAAK_API_KEY=5416979553113
const DAAK_API_SECRET="OvUJoA9pFfcntWr8yxNV"




// ── Company priority chain — sirf implemented couriers ─────────
const ROTATION_COURIERS = ["Leopards", "M&P", "Trax"]; // smart city-rotation sirf inhi mein

// ── Normalize store settings with safe defaults ──
const normalizeStoreSettings = (settings) => {
  const validCouriers = ["M&P", "Leopards", "BarqRaftaar", "Trax"];
  const validBookingModes = ["Auto", "Manual"];
  const validServicesByCourer = {
    "M&P": ["Overnight", "SecondDay"],
    "Leopards": ["Overnight", "Detain", "Overland"],
    "BarqRaftaar": ["Overnight", "Detain", "Overland"],
    "Trax": ["Overnight", "Detain", "Overland"],
  };

  const defaultCourier = settings?.defaultCourier;
  const defaultWeight = settings?.defaultWeight;
  const orderBooking = settings?.orderBooking;
  const defaultService = settings?.defaultService;

  // Normalize courier
  const normalizedCourier = validCouriers.includes(defaultCourier)
    ? defaultCourier
    : "M&P";

  // Normalize weight - ensure it's a valid positive number with max 2 decimal places
  let normalizedWeight = "0.5"; // default weight in kg
  if (defaultWeight) {
    const weightStr = String(defaultWeight).trim();
    if (/^\d+(\.\d{1,2})?$/.test(weightStr)) {
      const weightNum = parseFloat(weightStr);
      if (weightNum > 0) {
        normalizedWeight = weightStr;
      }
    }
  }

  // Normalize booking mode
  const normalizedBookingMode = validBookingModes.includes(orderBooking)
    ? orderBooking
    : "Auto";

  // Normalize service - must be valid for the courier
  const validServices = validServicesByCourer[normalizedCourier] || ["Overnight"];
  const normalizedService = validServices.includes(defaultService)
    ? defaultService
    : "Overnight";

  return {
    defaultCourier: normalizedCourier,
    defaultWeight: normalizedWeight,
    orderBooking: normalizedBookingMode,
    defaultService: normalizedService,
  };
};

const buildCourierChain = (defaultCourier) => {
  if (defaultCourier === "BarqRaftar") {
    // BarqRaftar sirf tab try hoga jab wahi default ho; fail hone par rotation companies fixed order mein
    return ["BarqRaftar", ...ROTATION_COURIERS];
  }
  if (ROTATION_COURIERS.includes(defaultCourier)) {
    return [defaultCourier, ...ROTATION_COURIERS.filter((c) => c !== defaultCourier)];
  }
  return [...ROTATION_COURIERS]; // BarqRaftar kabhi rotation mein khud se nahi aayega
};

// ── City cache (ek cron run ke andar company ki city list ek hi baar fetch ho) ──
const buildCityCache = () => {
  const cache = {};
  return async (company) => {
    if (cache[company]) return cache[company];
    let result;
    if (company === "Leopards") result = await fetchLeopardsCities();
    else if (company === "M&P") result = await fetchMnPCities();
    else if (company === "Trax") result = await fetchTrexCities();
    else if (company === "BarqRaftar") result = await fetchDaakCities();
    else result = { cities: [] };
    cache[company] = result.cities || [];
    return cache[company];
  };
};

const findCityMatch = (cities, rawName) => {
  if (!rawName) return null;
  const target = String(rawName).trim().toLowerCase();
  return cities.find((c) => c?.name && String(c.name).trim().toLowerCase() === target) || null;
};

// ── Phone normalize: Shopify se aksar +92 ya 92 format aata hai ──
const normalizeConsigneePhone = (raw) => {
  if (!raw) return "";
  let digits = String(raw).replace(/\D/g, "");
  if (digits.startsWith("92") && digits.length === 12) digits = "0" + digits.slice(2);
  else if (digits.length === 10 && digits.startsWith("3")) digits = "0" + digits;
  return digits;
};

// ── Shipper select per company (BookAPacket.jsx wala hi logic) ──
const pickShipperForCompany = (shippersForUser, companyName) => {
  let pool = (shippersForUser || []).filter((s) => !s.isShipperBlocked);
  if (companyName === "M&P") pool = pool.filter((s) => s.mnpLocationId && s.mnpSubAccountId);
  if (companyName === "BarqRaftar") pool = pool.filter((s) => s.daakId && s.daakCityId);
  if (!pool.length) return null;
  return (
    pool.find((s) => s.isDefaultShipper) ||
    [...pool].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
  );
};

const buildShipperInfo = (shipper, companyName, userName) => ({
  pickupAddress:
    companyName === "M&P" ? shipper.mnpAddress || ""
    : companyName === "Leopards" ? shipper.leopardsAddress || ""
    : companyName === "BarqRaftar" ? shipper.daakAddress || ""
    : shipper.traxAddress || "",
  shipperPhone: shipper.shipperPhone || "",
  shipperName:
    companyName === "M&P"
      ? shipper.shipperName ? `${shipper.shipperName} (${shipper.shipperPhone})` : ""
      : shipper.shipperName || "",
  shipperEmail: shipper.shipperEmail || "",
  shipmentId:
    companyName === "Leopards" ? shipper.leopardsId || ""
    : companyName === "M&P" ? shipper.mnpSubAccountId || ""
    : companyName === "BarqRaftar" ? shipper.daakId || ""
    : shipper.traxId || "",
  userName: userName || "",
});

// ── Har company ka actual booking call (existing controllers jaisa hi logic, bas req/res ke bagair) ──
const bookLeopardsCore = async ({ destinationCityId, destinationCityName, consigneeName, consigneePhone, consigneeAddress, quantity, netWeightKg, codAmount, productName, referenceNumber, userReferenceNumber, shipperInfo, service }) => {
  const shipper = await shipperModal.findOne({ shipperName: shipperInfo.shipperName });
  if (!shipper) return { success: false, error: `Shipper not found: ${shipperInfo.shipperName}` };

  const zoneName = normalizedCityToZone[String(destinationCityName).trim().toUpperCase()] || "Unknown";
  const dc = await getDeliveryCharge(shipper, zoneName, netWeightKg, destinationCityName, shipper.leopardsCityName, service || "Overnight", "Leopards");

  const creditResult = await checkShipperCredit(shipperInfo.userName, dc, Number(codAmount) || 0);
  if (!creditResult.allowed) return { success: false, error: creditResult.message };

  const finalInstructions = "Handle with care fragile product";

  const payload = {
    api_key: apiKey,
    api_password: apiPassword,
    booked_packet_weight: Math.round(Number(netWeightKg) * 1000),
    booked_packet_vol_weight_w: 0,
    booked_packet_vol_weight_h: 0,
    booked_packet_vol_weight_l: 0,
    booked_packet_no_piece: Number(quantity),
    booked_packet_collect_amount: Number(codAmount),
    booked_packet_order_id: referenceNumber || "",
    origin_city: shipper?.leopardsCityId || "self",
    destination_city: destinationCityId,
    shipment_id: shipperInfo.shipmentId,
    shipment_name_eng: shipperInfo.shipperName,
    shipment_email: shipperInfo.shipperEmail || "",
    shipment_phone: shipperInfo.shipperPhone,
    shipment_address: shipperInfo.pickupAddress,
    consignment_name_eng: consigneeName,
    consignment_email: "",
    consignment_phone: consigneePhone,
    consignment_phone_two: "",
    consignment_phone_three: "",
    consignment_address: consigneeAddress,
    special_instructions: finalInstructions,
    shipment_type: (service || "overnight").toString().toLowerCase(),
    custom_data: [],
    return_address: "",
    return_city: "",
    is_vpc: 0,
  };

  let response;
  try {
    response = await axios.post(`${baseUrl}/bookPacket/format/json/`, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 120000,
    });
  } catch (error) {
    return { success: false, error: `Leopards API error: ${error.message}` };
  }
  if (response.data.status !== 1) {
    return { success: false, error: `Leopards failed: ${response.data.error || "Unknown error"}` };
  }

  const companyId = await getNextCompanyId();
  await leopardsOrdersmodal.create({
    companyId,
    companyName: "Leopards",
    source: "Shopify",
    destinationCityId: String(destinationCityId),
    destinationCityName: String(destinationCityName),
    productName: productName || "General item",
    consigneePhone,
    whatsappNumber: formatWhatsappPhoneNumber(consigneePhone),
    consigneePhone2: "",
    consigneeName,
    quantity: Number(quantity),
    origin_city: shipper?.leopardsCityName || "self",
    consigneeAddress,
    netWeight: Number(netWeightKg),
    codAmount: Number(codAmount),
    deliveryCharge: dc,
    ceoDeliveryChargeRecord: dc,
    referenceNumber: referenceNumber || "",
    userReferenceNumber: userReferenceNumber || "",
    specialInstructions: finalInstructions,
    shipmentType: (service ? (service.charAt(0).toUpperCase() + service.slice(1).toLowerCase()) : "Overnight"),
    shipperInfo: {
      pickupAddress: shipperInfo.pickupAddress,
      shipperPhone: shipperInfo.shipperPhone,
      shipperName: shipperInfo.shipperName,
      shipperEmail: shipperInfo.shipperEmail || "",
      shipmentId: shipperInfo.shipmentId,
      userName: String(shipperInfo.userName),
    },
    trackNumber: response.data.track_number,
    slipLink: response.data.slip_link,
    bcStatus: "Booked",
    apiStatus: "Booked",
    createdAt: new Date(),
  });

  return { success: true, trackNumber: response.data.track_number, deliveryCharge: dc };
};

const bookTraxCore = async ({ destinationCityId, destinationCityName, consigneeName, consigneePhone, consigneeAddress, quantity, netWeightKg, codAmount, productName, referenceNumber, userReferenceNumber, shipperInfo, service }) => {
  const shipper = await shipperModal.findOne({ traxId: shipperInfo.shipmentId });
  if (!shipper) return { success: false, error: `Shipper not found for traxId: ${shipperInfo.shipmentId}` };

  const zoneName = normalizedCityToZone[String(destinationCityName).trim().toUpperCase()] || "Unknown";
  const dc = await getDeliveryCharge(shipper, zoneName, netWeightKg, destinationCityName, shipper.traxCityName, service || "Overnight", "Trax");

  const creditResult = await checkShipperCredit(shipperInfo.userName, dc, Number(codAmount) || 0);
  if (!creditResult.allowed) return { success: false, error: creditResult.message };

  const finalInstructions = "Handle with care fragile product";
  const companyId = await getNextCompanyId();
 
  const payload = {
    service_type_id: 1,
    pickup_address_id: shipperInfo.shipmentId,
    information_display: 0,
    consignee_city_id: String(destinationCityId),
    consignee_name: consigneeName,
    consignee_address: consigneeAddress,
    consignee_phone_number_1: consigneePhone,
    consignee_email_address: shipperInfo.shipperEmail || "hello@trax.pk",
    order_id: referenceNumber || "",
    item_product_type_id: 24,
    item_description: productName || "General item",
    item_quantity: Number(quantity),
    item_insurance: 0,
    item_price: Number(codAmount) === 0 ? 2000 : Number(codAmount),
    parcel_value: 2000,
    pickup_date: new Date().toISOString().split("T")[0],
    special_instructions: finalInstructions,
    estimated_weight: Number(netWeightKg),
    shipping_mode_id: 1,
    same_day_timing_id: 2,
    amount: Number(codAmount) === 0 ? 1 : Number(codAmount),
    payment_mode_id: Number(codAmount) === 0 ? 4 : 1,
    charges_mode_id: 4,
    open_shipment: 0,
    pieces_quantity: Number(quantity),
    shipper_reference_number_1: referenceNumber || "",
    shipper_reference_number_2: userReferenceNumber || "",
  };

  let response;
  try {
    response = await axios.post(`${baseUrlTrax}/shipment/book`, payload, {
      headers: { "Content-Type": "application/json", Authorization: apiKeyTrax },
    });
  } catch (error) {
    return { success: false, error: `Trax API error: ${error.message}` };
  }
  if (response.data.status !== 0) {
    return { success: false, error: `Trax failed: ${JSON.stringify(response.data)}` };
  }

  await leopardsOrdersmodal.create({
    companyId,
    companyName: "Trax",
    source: "Shopify",
    destinationCityId: String(destinationCityId),
    destinationCityName: String(destinationCityName),
    consigneePhone,
    whatsappNumber: formatWhatsappPhoneNumber(consigneePhone),
    consigneePhone2: "",
    consigneeName,
    productName: productName || "General item",
    quantity: Number(quantity),
    consigneeAddress,
    netWeight: Number(netWeightKg),
    origin_city: shipper?.traxCityName || "self",
    codAmount: Number(codAmount) === 0 ? 1 : Number(codAmount),
    deliveryCharge: dc,
    ceoDeliveryChargeRecord: dc,
    referenceNumber: referenceNumber || "",
    userReferenceNumber: userReferenceNumber || "",
    specialInstructions: finalInstructions,
    shipmentType: (service ? (service.charAt(0).toUpperCase() + service.slice(1).toLowerCase()) : "Overnight"),
    shipperInfo: {
      pickupAddress: shipperInfo.pickupAddress,
      shipperPhone: shipperInfo.shipperPhone,
      shipperName: shipperInfo.shipperName,
      shipperEmail: shipperInfo.shipperEmail || "",
      shipmentId: shipperInfo.shipmentId,
      userName: shipperInfo.userName,
    },
    trackNumber: response.data.tracking_number,
    bcStatus: "Booked",
    apiStatus: "Booked",
    createdAt: new Date(),
  });

  return { success: true, trackNumber: response.data.tracking_number, deliveryCharge: dc };
};

const bookMPCore = async ({ destinationCityName, consigneeName, consigneePhone, consigneeAddress, quantity, netWeightGrams, codAmount, productName, referenceNumber, userReferenceNumber, shipperInfo, locationId, service }) => {
  const shippers = await shipperModal.find({ mnpSubAccountId: shipperInfo.shipmentId, mnpLocationId: locationId });
  if (!shippers?.length) return { success: false, error: `Shipper not found for M&P subaccount: ${shipperInfo.shipmentId}` };
  const shipper = shippers[0];

  const zoneName = normalizedCityToZone[String(destinationCityName).trim().toUpperCase()] || "Unknown";
  const dc = await getDeliveryCharge(shipper, zoneName, Number(netWeightGrams) / 1000, destinationCityName, shipper.mnpCityName || "Lahore", service || "Overnight", "M&P");

  const creditResult = await checkShipperCredit(shipperInfo.userName, dc, Number(codAmount) || 0);
  if (!creditResult.allowed) return { success: false, error: creditResult.message };

  const companyId = await getNextCompanyId();

  let packet;
  try {
    const [created] = await leopardsOrdersmodal.create([{
      companyId,
      companyName: "M&P",
        source: "Shopify",
      destinationCityName: String(destinationCityName),
      consigneePhone,
      whatsappNumber: formatWhatsappPhoneNumber(consigneePhone),
      consigneePhone2: "",
      consigneeName,
      productName: productName || "General item",
      quantity: Number(quantity),
      origin_city: shipper.mnpCityName || "Lahore",
      consigneeAddress,
      netWeight: Number(netWeightGrams),
      codAmount: Number(codAmount),
      deliveryCharge: dc,
      ceoDeliveryChargeRecord: dc,
      referenceNumber: referenceNumber || "",
      userReferenceNumber: userReferenceNumber || "",
      specialInstructions: "Handle with care fragile product",
      shipmentType: (service ? (service.charAt(0).toUpperCase() + service.slice(1).toLowerCase()) : "Overnight"),
      locationId,
      mnpSubAccountId: shipper.mnpSubAccountId,
      shipperInfo: {
        pickupAddress: shipperInfo.pickupAddress,
        shipperPhone: shipperInfo.shipperPhone,
        shipperName: shipperInfo.shipperName,
        shipperEmail: shipperInfo.shipperEmail || "",
        shipmentId: shipperInfo.shipmentId,
        userName: String(shipperInfo.userName),
      },
      trackNumber: "",
      bcStatus: "Pending",
      apiStatus: "Pending",
      createdAt: new Date(),
    }]);
    packet = created;
  } catch (error) {
    console.error("FULL ERROR STACK:", error.stack);
    return { success: false, error: `DB save failed: ${error.message}` };
  }

  const payload = {
    username: "LIONEXCOURIER_API_281809",
    password: "raja1209G!",
    accountNo: "281809",
    consigneeName,
    consigneeAddress,
    consigneeMobNo: consigneePhone,
    consigneeEmail: shipperInfo.shipperEmail || "",
    destinationCityName,
    pieces: Number(quantity),
    weight: Number(netWeightGrams),
    codAmount: Number(codAmount),
    custRefNo: companyId,
    productDetails: productName || "General item",
    fragile: "Yes",
    Service: (service && service.toString().toLowerCase().includes('second')) ? 'S' : 'O',
    Remarks: "Handle with care fragile product",
    InsuranceValue: 0,
    locationID: locationId,
    ReturnLocation: locationId,
  };

  let response;
  try {
    response = await axios.post(mpConfig.apiUrl, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });
  } catch (error) {
    await leopardsOrdersmodal.deleteOne({ _id: packet._id });
    return { success: false, error: `M&P API error: ${error.message}` };
  }

  if (response.data[0]?.isSuccess === "true") {
    await leopardsOrdersmodal.updateOne(
      { _id: packet._id },
      {
        trackNumber: response.data[0]?.orderReferenceId || "",
        bcStatus: "Booked",
        apiStatus: "Booked",
      }
    );
    return { success: true, trackNumber: response.data[0]?.orderReferenceId || "", deliveryCharge: dc };
  }

  await leopardsOrdersmodal.deleteOne({ _id: packet._id });
  return { success: false, error: response.data[0]?.message || "M&P booking failed" };
};


const bookDaakCore = async ({ destinationCityId, destinationCityName, consigneeName, consigneePhone, consigneeAddress, quantity, netWeightKg, codAmount, referenceNumber, userReferenceNumber, shipperInfo, service }) => {
  const shipper = await shipperModal.findOne({ shipperName: shipperInfo.shipperName });
  if (!shipper) return { success: false, error: `Shipper not found: ${shipperInfo.shipperName}` };
  if (!shipper.daakCityId || !shipper.daakId) return { success: false, error: "Shipper missing Daak city ID or Daak ID" };

  const zoneName = normalizedCityToZone[String(destinationCityName).trim().toUpperCase()] || "Unknown";
  const dc = await getDeliveryCharge(shipper, zoneName, netWeightKg, destinationCityName, shipper.daakCityName, service || "Overnight", "BarqRaftar");

  const creditResult = await checkShipperCredit(shipperInfo.userName, dc, Number(codAmount) || 0);
  if (!creditResult.allowed) return { success: false, error: creditResult.message };

  const formattedConsigneePhone = "92" + consigneePhone.slice(1);
  const finalInstructions = "Handle with care fragile product";

  const order = {
    reference_id: userReferenceNumber || "",
    customer_name: consigneeName,
    customer_address: consigneeAddress,
    customer_contact: formattedConsigneePhone,
    customer_email: "lionex.info.com",
    special_handling: false,
    total_amount: Number(codAmount),
    cod_amount: Number(codAmount),
    remarks: finalInstructions,
    to_city_id: parseInt(destinationCityId, 10),
    from_city_id: shipper.daakCityId,
    shipment_type: "cod",
    weight_grams: Math.round(Number(netWeightKg) * 1000),
    line_items: [{ name: "Item", quantity: Number(quantity) }],
  };

  const payload = {
    total_orders: 1,
    orders: [order],
    create_pickup_request: "true",
    pickup_address_id: shipper.daakId,
    pickup_address: {
      name: shipper.daakCityName,
      address: shipper.daakAddress,
      latitude: null,
      longitude: null,
      person_of_contact: shipper.shipperName,
      phone_number: shipper.shipperPhone,
      city_id: shipper.daakCityId.toString(),
    },
    remarks: finalInstructions,
  };

  let response;
  try {
    response = await axios.post("https://barqraftar.pk/api/v1/orders/bulk_store", payload, {
      headers: { "Content-Type": "application/json", key: DAAK_API_KEY, secret: DAAK_API_SECRET },
      timeout: 180000,
    });
  } catch (error) {
    return { success: false, error: `Daak API error: ${error.message}` };
  }

  if (response.data.success_orders_count !== 1 || !response.data.orders_result[0].success) {
    return { success: false, error: `Daak failed: ${response.data.orders_result[0]?.message || "Unknown error"}` };
  }

  const trackNumber = response.data.orders_result[0].tracking_number;
  const companyId = await getNextCompanyId();

  await leopardsOrdersmodal.create({
    companyId,
    companyName: "BarqRaftar",
    source: "Shopify",
    destinationCityId: String(destinationCityId),
    destinationCityName: String(destinationCityName),
    consigneePhone,
    whatsappNumber: formatWhatsappPhoneNumber(consigneePhone),
    consigneePhone2: "",
    consigneeName,
    quantity: Number(quantity),
    origin_city: shipper?.daakCityName || "self",
    consigneeAddress,
    netWeight: Number(netWeightKg),
    codAmount: Number(codAmount),
    deliveryCharge: dc,
    ceoDeliveryChargeRecord: dc,
    referenceNumber: shipperInfo.userName,
    userReferenceNumber: userReferenceNumber || "",
    specialInstructions: finalInstructions,
    shipmentType: (service ? (service.charAt(0).toUpperCase() + service.slice(1).toLowerCase()) : "Overnight"),
    shipperInfo: {
      pickupAddress: shipperInfo.pickupAddress,
      shipperPhone: shipperInfo.shipperPhone,
      shipperName: shipperInfo.shipperName,
      shipperEmail: shipperInfo.shipperEmail || "",
      daakId: shipperInfo.shipmentId,
      shipmentId: shipperInfo.shipmentId,
      userName: String(shipperInfo.userName),
    },
    trackNumber,
    bcStatus: "Booked",
    apiStatus: "Pending",
    createdAt: new Date(),
  });

  return { success: true, trackNumber, deliveryCharge: dc };
};

// ── Main cron function ──────────────────────────────────────────
export const autoBookShopifyOrders = async () => {
  console.log("autoBookShopifyOrders: cron started");
  const getCitiesForCompany = buildCityCache();

  const newOrders = await shopifyOrdersModal.find({ fulfillmentStatus: "UNFULFILLED" });
  if (!newOrders.length) return console.log("autoBookShopifyOrders: no new orders");

  // shopDomain wise group
  const ordersByShop = new Map();
  for (const order of newOrders) {
    const key = order.shopDomain || "unknown";
    if (!ordersByShop.has(key)) ordersByShop.set(key, []);
    ordersByShop.get(key).push(order);
  }

  const shipperCache = new Map(); // userName -> shippers[]

  for (const [shopDomain, orders] of ordersByShop) {
    const storeSettings = await Store.findOne({ shopDomain });
    if (!storeSettings) {
      continue;
    }

    // Check both ShopifyStoreSettings and settings field names for compatibility
    const storeSettingsData = storeSettings.ShopifyStoreSettings || storeSettings.settings || {};
    const orderBookingMode = storeSettingsData.orderBooking || "Auto";

    // Skip if booking mode is Manual
    if (orderBookingMode !== "Auto") {
      continue; // manual store — skip, status New hi rahega
    }

    // Normalize settings with safe defaults
    const normalizedSettings = normalizeStoreSettings(storeSettingsData);
    const defaultCourier = normalizedSettings.defaultCourier;
    const defaultWeightKg = parseFloat(normalizedSettings.defaultWeight) || 0.5;
    const defaultService = normalizedSettings.defaultService || "Overnight";
    const chain = buildCourierChain(defaultCourier);

    // userName wise group (shipper ek hi baar fetch)
    const ordersByUser = new Map();
    for (const order of orders) {
      const orderUserName = String(
        order.userName || storeSettingsData.username || storeSettings.userName || ""
      ).trim();

      if (!orderUserName) {
        order.fulfillmentStatus = "Error";
        order.bookingError = "Missing dashboard userName for Shopify order";
        await order.save({ validateBeforeSave: false });
        continue;
      }

      if (order.userName !== orderUserName) {
        order.userName = orderUserName;
      }

      if (!ordersByUser.has(orderUserName)) ordersByUser.set(orderUserName, []);
      ordersByUser.get(orderUserName).push(order);
    }

    for (const [userName, userOrders] of ordersByUser) {
      if (!shipperCache.has(userName)) {
        const shippers = await shipperModal.find({ userName });
        shipperCache.set(userName, shippers);
      }
      const shippersForUser = shipperCache.get(userName);

      for (const order of userOrders) {
        try {
          const consigneePhone = normalizeConsigneePhone(order.phone);
          const addressParts = [order.address?.address1, order.address?.address2].filter(Boolean);
          if (order.address?.province) addressParts.push(`Province ${order.address.province}`);
          const consigneeAddress = addressParts.join(", ").slice(0, 200);
          const cityRaw = order.address?.city || "";
          const quantity = order.itemCount && order.itemCount > 0 ? order.itemCount : 1;
          const productName = String(order.orderNumber || order.orderName || "General Item");
          const referenceNumber = userName;
          const userReferenceNumber = order.orderName || String(order.orderNumber || "");
          const codAmount = String(order.financialStatus).toUpperCase() === "PAID" ? 0 : Number(order.totalPrice) || 0;

          if (order.address?.countryCode !== "PK") {
            order.fulfillmentStatus = "Error";
            order.bookingError = "Non-Pakistan order - skipped";
            await order.save();
            continue;
          }
          if (!consigneePhone || !/^03[0-9]{9}$/.test(consigneePhone)) {
            order.fulfillmentStatus = "Error";
            order.bookingError = "Invalid consignee phone number";
            await order.save();
            continue;
          }
          if (!order.customerName || !cityRaw) {
            order.fulfillmentStatus = "Error";
            order.bookingError = "Missing consignee name or city";
            await order.save();
            continue;
          }

          // ── City match chain ──
          let chosenCompany = null;
          let chosenCity = null;
          for (const company of chain) {
            const cities = await getCitiesForCompany(company);
            const match = findCityMatch(cities, cityRaw);
            if (match) {
              chosenCompany = company;
              chosenCity = match;
              break;
            }
          }
          if (!chosenCompany) {
            order.fulfillmentStatus = "Error";
            order.bookingError = `City not found in any courier: ${cityRaw}`;
            await order.save();
            continue;
          }

          const shipper = pickShipperForCompany(shippersForUser, chosenCompany);
          if (!shipper) {
            order.fulfillmentStatus = "Error";
            order.bookingError = `No valid shipper for ${chosenCompany}`;
            await order.save();
            continue;
          }
          const shipperInfo = buildShipperInfo(shipper, chosenCompany, userName);
          if (!shipperInfo.shipmentId || !shipperInfo.pickupAddress || !shipperInfo.shipperPhone) {
            order.fulfillmentStatus = "Error";
            order.bookingError = `Shipper missing required ${chosenCompany} details`;
            await order.save();
            continue;
          }

          let result;
          if (chosenCompany === "Leopards") {
            result = await bookLeopardsCore({
              destinationCityId: chosenCity.id,
              destinationCityName: chosenCity.name,
              consigneeName: order.customerName,
              consigneePhone,
              consigneeAddress,
              quantity,
              netWeightKg: defaultWeightKg,
              codAmount,
              productName,
              referenceNumber,
              userReferenceNumber,
              shipperInfo,
              service: defaultService,
            });
          } else if (chosenCompany === "Trax") {
            result = await bookTraxCore({
              destinationCityId: chosenCity.id,
              destinationCityName: chosenCity.name,
              consigneeName: order.customerName,
              consigneePhone,
              consigneeAddress,
              quantity,
              netWeightKg: defaultWeightKg,
              codAmount,
              productName,
              referenceNumber,
              userReferenceNumber,
              shipperInfo,
              service: defaultService,
            });
          } else if (chosenCompany === "BarqRaftar") {
            result = await bookDaakCore({
              destinationCityId: chosenCity.id,
              destinationCityName: chosenCity.name,
              consigneeName: order.customerName,
              consigneePhone,
              consigneeAddress,
              quantity,
              netWeightKg: defaultWeightKg,
              codAmount,
              referenceNumber,
              userReferenceNumber,
              shipperInfo,
              service: defaultService,
            });
          } else {
            result = await bookMPCore({
              destinationCityName: chosenCity.name,
              consigneeName: order.customerName,
              consigneePhone,
              consigneeAddress,
              quantity,
              netWeightGrams: Math.round(defaultWeightKg * 1000),
              codAmount,
              productName,
              referenceNumber,
              userReferenceNumber,
              shipperInfo,
              locationId: shipper.mnpLocationId,
              service: defaultService,
            });
          }

          order.weightGrams = Math.round(defaultWeightKg * 1000);
          if (result.success) {
            order.fulfillmentStatus = "Fulfilled";
            order.trackNumber = result.trackNumber;
            order.bookedCourier = chosenCompany;
          } else {
            order.fulfillmentStatus = "Error";
            order.bookingError = result.error;
          }
          await order.save();
        } catch (err) {
          order.fulfillmentStatus = "Error";
          order.bookingError = err.message;
          await order.save();
        }
      }
    }
  }

  console.log("autoBookShopifyOrders: cron finished");
};

// Har 20 minute baad chalega
// cron.schedule("*/20 * * * *", () => {
//   autoBookShopifyOrders();
// });
