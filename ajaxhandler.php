<?php
// shortcut functions
function array_ifexists($key,$arr,$def=NULL) {
	return (is_array($arr) && array_key_exists($key,$arr)) ? $arr[$key] : $def;
}
function erase_cart() {
	global $db;
	$q = "DELETE FROM cart_items;";
	$r = $db->query($q);
}
function get_cart_totals() {
	global $db;
	$q = "SELECT SUM(qty) AS num, SUM(price*qty) AS price FROM cart_items;";
	$ret = array('cart_count'=>0, 'cart_total'=>0);
	if ($r = $db->query($q)) {
		$rr = $r->fetch_assoc();
		$ret['cart_count'] = $rr['num'];
		$ret['cart_total'] = $rr['price'];
		$r->free();
	}
	return $ret;
}
function get_cart_contents() {
	global $db, $deliver_per_cart, $deliver_per_item, $tax_rate;
	$q = "SELECT id, code, name, price, priceunit, qty, descript, img FROM cart_items;";
	$tr=array('items'=>array(), 'item_count'=>0, 'subtotal'=>0,
	          'delivery'=>$deliver_per_cart, 'tax'=>0, 'total'=>0);
	$included_discounts = 0;
	if ($r = $db->query($q)) {
		while ($rr = $r->fetch_assoc()) {
			$xferkeys = array('id'=>'id','code'=>'code','name'=>'name','price'=>'price',
			                  'qty'=>'quantity','priceunit'=>'priceunit',
			                  'descript'=>'description','img'=>'imgpath');
			$newitem = array();
			foreach($xferkeys as $k=>$v) {
				$newitem[$v] = $rr[$k];
			}
			if ($included_discounts < 2) {
				$included_discounts++;
				$newitem['discounts'] = array(array('text'=>'Discount text number 1! $2.00 off', 'amt'=>2, 'class'=>'saleitem'),
					array('text'=>'Discount applied on SanPeligrino', 'amt'=>5, 'class'=>'coupon'),
				);
			}
			$newitem['subtotal']=($rr['qty']*$rr['price']);
			$tr['subtotal']+=$newitem['subtotal'];
			$tr['item_count']+=($rr['qty']);
			$tr['items'][]=$newitem;
		}
	}
	if (!$tr['item_count']) { $tr['delivery']=0; }
	$tr['delivery'] += $deliver_per_item * $tr['item_count'];
	$tr['tax'] = $tr['subtotal'] * $tax_rate;
	$tr['total'] = $tr['subtotal'] + $tr['delivery'] + $tr['tax'];
	return $tr;
}
// some global variables
$delivery_per_item = 0;
$delivery_per_cart = 4.95;
$tax_rate = .1;
// set up the database
$db = new mysqli('localhost','zipster_user','password','zipster');
if (!$db) {
	die(json_encode(array('result'=>'ERROR', 'msg'=>'No Database Connection')));
}
// route the request
$method = array_ifexists('requestType',$_POST);
$result = array('requestType'=>$method);
//error_log("running method=$method");
switch($method) {
	case 'product-catalog':
		$ret = [];
		$q = "SELECT * FROM categories";
		if ($r = $db->query($q)) {
			while ($rr = $r->fetch_assoc()) {
				$ret[$rr['id']] = $rr;
			}
			$r->free();
		}
		$q = "SELECT * FROM products";
		if ($r = $db->query($q)) {
			while ($rr = $r->fetch_assoc()) {
				$ret[$rr['cat_id']]['products'][$rr['id']] = $rr;
			}
			$r->free();
		}
		$result['data'] = $ret;
		break;
	case 'product':
		$ret = [];
		$id = (int) array_ifexists('id', $_POST);
		if ($id) {
			$q = "SELECT * FROM products WHERE id='$id'";
			$r = $db->query($q);
			$result['data'] = $r->fetch_assoc();
		}
		else {
			$result['result']='ERROR';
			$result['msg']='Bad ID passed';
		}
		break;
	default:
		$result['result']='ERROR';
		$result['msg']='Bad request type';
		break;
}
if (!array_ifexists('result',$result)) { $result['result']='OK'; }
echo json_encode($result);